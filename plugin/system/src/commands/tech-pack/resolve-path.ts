/**
 * Resolve a manifest-relative path to a project-relative path.
 *
 * Usage:
 *   sdd-system tech-pack resolve-path --namespace <ns> --path <relative-path>
 */

import { join } from 'node:path';
import type { CommandResult } from '@/lib/args';
import { resolveTechPackDir } from './manifest';

export const resolveTechPackPath = async (
  namespace: string,
  relativePath: string
): Promise<CommandResult> => {
  const dirResult = await resolveTechPackDir(namespace);
  if (!dirResult.success) {
    return dirResult;
  }

  const { techPackDir } = dirResult.data as { techPackDir: string };
  const resolvedPath = join(techPackDir, relativePath);

  return {
    success: true,
    data: { resolved_path: resolvedPath },
  };
};
