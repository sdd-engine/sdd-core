/**
 * Read a skill file with placeholder resolution.
 *
 * Usage:
 *   sdd-system tech-pack load-skill --namespace <ns> --skill <name>
 */

import { join } from 'node:path';
import type { CommandResult } from '@/lib/args';
import { exists, readText } from '@/lib/fs';
import { readV2Manifest, type V2Manifest } from './manifest';

export const loadSkill = async (
  namespace: string,
  skillName: string
): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest, techPackDir } = result.data as { manifest: V2Manifest; techPackDir: string };

  const relativePath = manifest.skills[skillName];
  if (relativePath === undefined) {
    return {
      success: false,
      error: `Skill "${skillName}" not found in skills registry`,
    };
  }

  const fullPath = join(techPackDir, relativePath);
  if (!(await exists(fullPath))) {
    return {
      success: false,
      error: `Skill file not found: ${fullPath}`,
    };
  }

  let content = await readText(fullPath);

  // Replace <techpack-root> placeholder with actual tech pack directory
  content = content.replace(/<techpack-root>/g, techPackDir);

  return {
    success: true,
    data: {
      name: skillName,
      path: fullPath,
      content,
    },
  };
};
