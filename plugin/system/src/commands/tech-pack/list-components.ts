/**
 * List component type metadata from a v2 manifest.
 *
 * Usage:
 *   sdd-system tech-pack list-components --namespace <ns>
 */

import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest, type Component } from './manifest';

export const listComponents = async (namespace: string): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest } = result.data as { manifest: V2Manifest };
  const components = Object.entries(manifest.components).map(
    ([name, comp]: [string, Component]) => ({
      name,
      description: comp.description,
      singleton: comp.singleton ?? false,
      directory_pattern: comp.directory_pattern,
      depends_on: comp.depends_on,
      skills: comp.skills,
      scaffolding: comp.scaffolding,
      ...(comp.agent !== undefined ? { agent: comp.agent } : {}),
    })
  );

  return {
    success: true,
    data: { components },
  };
};
