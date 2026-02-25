/**
 * Look up phase orchestrator skills and/or component skills.
 *
 * Usage:
 *   sdd-system tech-pack route-skills --namespace <ns> --phase <phase> [--component <type>]
 */

import { join } from 'node:path';
import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest } from './manifest';

type SkillRef = { readonly name: string; readonly path: string };

const resolveSkillNames = (
  names: readonly string[],
  skillsRegistry: Readonly<Record<string, string>>,
  techPackDir: string
): { resolved: readonly SkillRef[]; missing: readonly string[] } => {
  const resolved: SkillRef[] = [];
  const missing: string[] = [];

  for (const name of names) {
    const relativePath = skillsRegistry[name];
    if (relativePath === undefined) {
      missing.push(name);
    } else {
      resolved.push({ name, path: join(techPackDir, relativePath) });
    }
  }

  return { resolved, missing };
};

export const routeSkills = async (
  namespace: string,
  phase: string,
  component?: string
): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest, techPackDir } = result.data as { manifest: V2Manifest; techPackDir: string };

  // If phase is absent from manifest, return empty results
  // (spec: absent phase = core runs without techpack contributions)
  const phaseEntry = manifest.phases[phase];

  const data: Record<string, unknown> = {};

  if (phaseEntry) {
    const { resolved, missing } = resolveSkillNames(
      phaseEntry.orchestrator_skills,
      manifest.skills,
      techPackDir
    );
    if (missing.length > 0) {
      return {
        success: false,
        error: `Phase "${phase}" references unknown skills: ${missing.join(', ')}`,
      };
    }
    data['orchestrator_skills'] = resolved;

    if (phaseEntry.agents && phaseEntry.agents.length > 0) {
      data['agents'] = phaseEntry.agents;
    }
  } else {
    data['orchestrator_skills'] = [];
  }

  // If component specified, also resolve component skills
  if (component !== undefined) {
    const compEntry = manifest.components[component];
    if (!compEntry) {
      return {
        success: false,
        error: `Component "${component}" not found in manifest`,
      };
    }
    const { resolved, missing } = resolveSkillNames(
      compEntry.skills,
      manifest.skills,
      techPackDir
    );
    if (missing.length > 0) {
      return {
        success: false,
        error: `Component "${component}" references unknown skills: ${missing.join(', ')}`,
      };
    }
    data['component_skills'] = resolved;
  }

  return { success: true, data };
};
