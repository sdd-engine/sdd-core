/**
 * Look up command handler and action info from the manifest.
 *
 * Usage:
 *   sdd-system tech-pack route-command --namespace <ns> --command <cmd> --action <action>
 */

import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest } from './manifest';

export const routeCommand = async (
  namespace: string,
  command: string,
  action: string
): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest } = result.data as { manifest: V2Manifest };

  const cmdNamespace = manifest.commands[command];
  if (!cmdNamespace) {
    return {
      success: false,
      error: `Command namespace "${command}" not found in manifest`,
    };
  }

  const actionEntry = cmdNamespace.actions[action];
  if (!actionEntry) {
    return {
      success: false,
      error: `Action "${action}" not found in command namespace "${command}"`,
    };
  }

  const data: Record<string, unknown> = {
    handler: cmdNamespace.handler,
    description: actionEntry.description,
    public: actionEntry.public,
  };

  if (cmdNamespace.skill !== undefined) {
    data['skill'] = cmdNamespace.skill;
  }
  if (actionEntry.destructive !== undefined) {
    data['destructive'] = actionEntry.destructive;
  }
  if (actionEntry.args !== undefined) {
    data['args'] = actionEntry.args;
  }

  return { success: true, data };
};
