/**
 * Tech pack validate command.
 *
 * Parses techpack.yaml, validates against the JSON Schema,
 * checks that referenced paths exist, validates registry cross-references,
 * and validates the dependency DAG.
 *
 * Usage:
 *   sdd-system tech-pack validate --path <tech-pack-dir>
 */

import * as path from 'node:path';
import { readText, exists } from '@/lib/fs';
import { validateAgainstSchema, type JsonSchema } from '@/lib/json-schema';
import { getSkillsDir } from '@/lib/config';
import type { CommandResult } from '@/lib/args';
import YAML from 'yaml';

/** Read and parse techpack.yaml from a directory. */
const readManifest = async (
  techPackDir: string
): Promise<{ readonly data: Record<string, unknown> } | { readonly error: string }> => {
  const manifestPath = path.join(techPackDir, 'techpack.yaml');
  if (!(await exists(manifestPath))) {
    return { error: `techpack.yaml not found at ${manifestPath}` };
  }
  const content = await readText(manifestPath);
  const data = YAML.parse(content) as Record<string, unknown>;
  return { data };
};

/** Read the techpack JSON schema from the core skills directory. */
const readTechpackSchema = async (): Promise<JsonSchema> => {
  const schemaPath = path.join(
    getSkillsDir(),
    'techpacks',
    'schemas',
    'techpack.schema.json'
  );
  const content = await readText(schemaPath);
  return JSON.parse(content) as JsonSchema;
};

/** Validate that all referenced file paths in the manifest exist. */
const validatePaths = async (
  techPackDir: string,
  manifest: Record<string, unknown>
): Promise<readonly string[]> => {
  const errors: string[] = [];
  const paths: Array<{ readonly field: string; readonly relativePath: string }> = [];

  // system_path
  const techPack = manifest['techpack'] as Record<string, unknown> | undefined;
  if (techPack?.['system_path']) {
    paths.push({ field: 'techpack.system_path', relativePath: techPack['system_path'] as string });
  }

  // Skills registry — all values are relative paths
  const skills = manifest['skills'] as Record<string, string> | undefined;
  if (skills) {
    for (const [name, relativePath] of Object.entries(skills)) {
      paths.push({ field: `skills.${name}`, relativePath });
    }
  }

  // Agents registry — all values are relative paths
  const agents = manifest['agents'] as Record<string, string> | undefined;
  if (agents) {
    for (const [name, relativePath] of Object.entries(agents)) {
      paths.push({ field: `agents.${name}`, relativePath });
    }
  }

  // Check each path
  for (const { field, relativePath } of paths) {
    const cleanPath = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
    const fullPath = path.join(techPackDir, cleanPath);
    if (!(await exists(fullPath))) {
      errors.push(`${field}: path does not exist — ${cleanPath}`);
    }
  }

  return errors;
};

/** Validate that all name references resolve to registry entries. */
const validateRegistryRefs = (manifest: Record<string, unknown>): readonly string[] => {
  const errors: string[] = [];
  const skills = manifest['skills'] as Record<string, string> | undefined;
  const agents = manifest['agents'] as Record<string, string> | undefined;
  const skillNames = new Set(skills ? Object.keys(skills) : []);
  const agentNames = new Set(agents ? Object.keys(agents) : []);

  // Components: scaffolding, skills[], agent must resolve
  const components = manifest['components'] as Record<string, Record<string, unknown>> | undefined;
  if (components) {
    for (const [typeName, comp] of Object.entries(components)) {
      const scaffolding = comp['scaffolding'] as string | undefined;
      if (scaffolding && !skillNames.has(scaffolding)) {
        errors.push(`components.${typeName}.scaffolding: skill "${scaffolding}" not in skills registry`);
      }
      const compSkills = (comp['skills'] as readonly string[] | undefined) ?? [];
      for (const s of compSkills) {
        if (!skillNames.has(s)) {
          errors.push(`components.${typeName}.skills: skill "${s}" not in skills registry`);
        }
      }
      const agent = comp['agent'] as string | undefined;
      if (agent && !agentNames.has(agent)) {
        errors.push(`components.${typeName}.agent: agent "${agent}" not in agents registry`);
      }
    }
  }

  // Phases: orchestrator_skills[], agents[] must resolve
  const phases = manifest['phases'] as Record<string, Record<string, unknown>> | undefined;
  if (phases) {
    for (const [phaseName, phase] of Object.entries(phases)) {
      const orchSkills = (phase['orchestrator_skills'] as readonly string[] | undefined) ?? [];
      for (const s of orchSkills) {
        if (!skillNames.has(s)) {
          errors.push(`phases.${phaseName}.orchestrator_skills: skill "${s}" not in skills registry`);
        }
      }
      const phaseAgents = (phase['agents'] as readonly string[] | undefined) ?? [];
      for (const a of phaseAgents) {
        if (!agentNames.has(a)) {
          errors.push(`phases.${phaseName}.agents: agent "${a}" not in agents registry`);
        }
      }
    }
  }

  // Help: capabilities and content must be skill names
  const help = manifest['help'] as Record<string, string> | undefined;
  if (help) {
    if (help['capabilities'] && !skillNames.has(help['capabilities'])) {
      errors.push(`help.capabilities: skill "${help['capabilities']}" not in skills registry`);
    }
    if (help['content'] && !skillNames.has(help['content'])) {
      errors.push(`help.content: skill "${help['content']}" not in skills registry`);
    }
  }

  // Commands: skill must be a skill name
  const commands = manifest['commands'] as Record<string, Record<string, unknown>> | undefined;
  if (commands) {
    for (const [nsName, ns] of Object.entries(commands)) {
      const skill = ns['skill'] as string | undefined;
      if (skill && !skillNames.has(skill)) {
        errors.push(`commands.${nsName}.skill: skill "${skill}" not in skills registry`);
      }
    }
  }

  return errors;
};

/** Validate the dependency DAG is acyclic. */
const validateDAG = (
  components: Record<string, Record<string, unknown>>
): readonly string[] => {
  const errors: string[] = [];
  const componentTypes = new Set(Object.keys(components));

  // Check all depends_on references are valid component types
  for (const [typeName, component] of Object.entries(components)) {
    const dependsOn = (component['depends_on'] as readonly string[]) ?? [];
    for (const dep of dependsOn) {
      if (!componentTypes.has(dep)) {
        errors.push(
          `components.${typeName}.depends_on: references unknown component type "${dep}"`
        );
      }
    }
  }

  // Check for cycles using topological sort (Kahn's algorithm)
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, readonly string[]> = {};

  for (const typeName of componentTypes) {
    inDegree[typeName] = 0;
    adjacency[typeName] = [];
  }

  for (const [typeName, component] of Object.entries(components)) {
    const dependsOn = (component['depends_on'] as readonly string[]) ?? [];
    for (const dep of dependsOn) {
      if (componentTypes.has(dep)) {
        adjacency[dep] = [...(adjacency[dep] ?? []), typeName];
        inDegree[typeName] = (inDegree[typeName] ?? 0) + 1;
      }
    }
  }

  const queue = Object.keys(inDegree).filter((k) => inDegree[k] === 0);
  let visited = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    visited++;
    for (const neighbor of adjacency[node] ?? []) {
      inDegree[neighbor] = (inDegree[neighbor] ?? 1) - 1;
      if ((inDegree[neighbor] ?? 0) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visited !== componentTypes.size) {
    errors.push('Dependency graph contains a cycle');
  }

  return errors;
};

export const validateTechPack = async (techPackPath: string): Promise<CommandResult> => {
  const techPackDir = path.resolve(techPackPath);

  // Step 1: Read manifest
  const manifestResult = await readManifest(techPackDir);
  if ('error' in manifestResult) {
    return { success: false, error: manifestResult.error };
  }
  const manifest = manifestResult.data;

  // Step 2: Validate against JSON Schema
  const techpackSchema = await readTechpackSchema();
  const schemaResult = validateAgainstSchema(manifest, techpackSchema);

  const schemaErrors: readonly string[] = !schemaResult.valid
    ? schemaResult.errors.map(
        (e) => `${e.instancePath || '/'}: ${e.message ?? 'unknown error'}`
      )
    : [];

  // Step 3: Validate referenced file paths exist
  const pathErrors = await validatePaths(techPackDir, manifest);

  // Step 4: Validate registry cross-references
  const refErrors = validateRegistryRefs(manifest);

  // Step 5: Validate dependency DAG
  const components = manifest['components'] as Record<string, Record<string, unknown>> | undefined;
  const dagErrors = components ? validateDAG(components) : [];

  // Combine results
  const allErrors = [...schemaErrors, ...pathErrors, ...refErrors, ...dagErrors];
  const techPack = manifest['techpack'] as Record<string, unknown> | undefined;
  const name = (techPack?.['name'] as string) ?? 'unknown';
  const namespace = (techPack?.['namespace'] as string) ?? 'unknown';

  if (allErrors.length > 0) {
    return {
      success: false,
      error: `Validation failed for tech pack "${name}" (${namespace}):\n${allErrors.map((e) => `  - ${e}`).join('\n')}`,
      data: { name, namespace, errors: allErrors },
    };
  }

  const componentCount = components ? Object.keys(components).length : 0;
  const commands = manifest['commands'] as Record<string, Record<string, unknown>> | undefined;
  const commandNamespaces = commands ? Object.keys(commands) : [];
  const actionCount = commandNamespaces.reduce((total, ns) => {
    const actions = commands![ns]!['actions'] as Record<string, unknown> | undefined;
    return total + (actions ? Object.keys(actions).length : 0);
  }, 0);

  return {
    success: true,
    message: `Tech pack "${name}" (${namespace}) is valid — ${componentCount} component types, ${commandNamespaces.length} command namespaces, ${actionCount} actions`,
    data: {
      name,
      namespace,
      version: techPack?.['version'],
      component_types: componentCount,
      command_namespaces: commandNamespaces.length,
      actions: actionCount,
    },
  };
};
