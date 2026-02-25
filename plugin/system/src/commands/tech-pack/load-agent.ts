/**
 * Agent metadata extraction and skill resolution.
 *
 * Usage:
 *   sdd-system tech-pack load-agent --namespace <ns> --agent <name>
 */

import { join } from 'node:path';
import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest } from './manifest';
import { agentFrontmatter } from '@/commands/agent/frontmatter';

export const loadAgent = async (
  namespace: string,
  agentName: string
): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest, techPackDir } = result.data as { manifest: V2Manifest; techPackDir: string };

  const relativePath = manifest.agents[agentName];
  if (relativePath === undefined) {
    return {
      success: false,
      error: `Agent "${agentName}" not found in agents registry`,
    };
  }

  const fullPath = join(techPackDir, relativePath);

  // Extract frontmatter using the existing agent frontmatter command
  const fmResult = await agentFrontmatter(fullPath);
  if (!fmResult.success) {
    return {
      success: false,
      error: `Failed to read agent frontmatter: ${fmResult.error}`,
    };
  }

  const fm = fmResult.data as Record<string, unknown>;

  // Resolve skill names from frontmatter to paths via skills registry
  const fmSkills = (fm['skills'] as readonly string[] | undefined) ?? [];
  const resolvedSkills: Array<{ name: string; path: string }> = [];

  for (const skillName of fmSkills) {
    const skillRelPath = manifest.skills[skillName];
    if (skillRelPath === undefined) {
      return {
        success: false,
        error: `Agent "${agentName}" references skill "${skillName}" not found in skills registry`,
      };
    }
    resolvedSkills.push({
      name: skillName,
      path: join(techPackDir, skillRelPath),
    });
  }

  return {
    success: true,
    data: {
      name: fm['name'] ?? agentName,
      description: fm['description'],
      model: fm['model'],
      tools: fm['tools'],
      skills: resolvedSkills,
      prompt: fullPath,
    },
  };
};
