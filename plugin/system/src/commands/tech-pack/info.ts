/**
 * Tech pack info command.
 *
 * Reads a tech pack's v2 manifest and returns structured data.
 *
 * Usage:
 *   sdd-system tech-pack info --namespace <namespace>
 */

import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest } from './manifest';

export const techPackInfo = async (namespace: string): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest, techPackDir } = result.data as { manifest: V2Manifest; techPackDir: string };

  const componentTypes = Object.keys(manifest.components);
  const commandNamespaces = Object.keys(manifest.commands);
  const actionCount = commandNamespaces.reduce((total, ns) => {
    return total + Object.keys(manifest.commands[ns]!.actions).length;
  }, 0);

  const data = {
    name: manifest.techpack.name,
    namespace: manifest.techpack.namespace,
    version: manifest.techpack.version,
    description: manifest.techpack.description,
    system_path: manifest.techpack.system_path,
    component_types: componentTypes,
    skills_count: Object.keys(manifest.skills).length,
    agents_count: Object.keys(manifest.agents).length,
    phases: Object.keys(manifest.phases),
    commands: commandNamespaces,
    action_count: actionCount,
    path: techPackDir,
  };

  return {
    success: true,
    message: `Tech pack: ${data.name} (${data.namespace}) v${data.version}\nComponents: ${componentTypes.join(', ')}\nCommands: ${commandNamespaces.length} namespaces, ${actionCount} actions`,
    data,
  };
};
