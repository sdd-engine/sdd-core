/**
 * Tech pack namespace command handler.
 *
 * Commands:
 *   validate         Validate a tech pack manifest
 *   list             List installed tech packs
 *   info             Show tech pack details
 *   install          Register a tech pack (--path, --repo, or no args)
 *   remove           Unregister a tech pack
 *   resolve-path     Resolve manifest-relative path to project-relative path
 *   list-components  List component type metadata
 *   dependency-order Topological sort of component dependencies
 *   route-skills     Look up phase/component skills and agents
 *   route-command    Look up command handler and action info
 *   load-skill       Read skill file with placeholder resolution
 *   load-agent       Agent metadata and skill resolution
 */

import type { CommandResult, GlobalOptions } from '@/lib/args';
import { parseNamedArgs } from '@/lib/args';
import { validateArgs, formatValidationErrors } from '@/lib/schema-validator';
import { schema, type TechPackArgs } from './schema';

export const handleTechPack = async (
  action: string,
  args: readonly string[],
  _options: GlobalOptions
): Promise<CommandResult> => {
  const { named } = parseNamedArgs(args);
  const techPackPath = named['path'];
  const namespace = named['namespace'];
  const repo = named['repo'];
  const ref = named['ref'];
  const skill = named['skill'];
  const agent = named['agent'];
  const phase = named['phase'];
  const component = named['component'];
  const command = named['command'];

  const validation = validateArgs<TechPackArgs>(
    { action, path: techPackPath, namespace, repo, ref, skill, agent, phase, component, command },
    schema
  );

  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid arguments:\n${formatValidationErrors(validation.errors)}`,
    };
  }

  const validatedArgs = validation.data;

  switch (validatedArgs.action) {
    case 'validate': {
      if (!validatedArgs.path) {
        return { success: false, error: 'Missing --path argument for validate' };
      }
      const { validateTechPack } = await import('./validate');
      return validateTechPack(validatedArgs.path);
    }

    case 'list': {
      const { listTechPacks } = await import('./list');
      return listTechPacks();
    }

    case 'info': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for info' };
      }
      const { techPackInfo } = await import('./info');
      return techPackInfo(validatedArgs.namespace);
    }

    case 'install': {
      // Three install modes:
      // 1. --repo: git clone install
      // 2. --path: local directory install
      // 3. No args: reinstall all from settings
      if (validatedArgs.repo) {
        const { installTechPackFromRepo } = await import('./install');
        return installTechPackFromRepo(validatedArgs.repo, validatedArgs.ref);
      }
      if (validatedArgs.path) {
        const { installTechPack } = await import('./install');
        return installTechPack(validatedArgs.path);
      }
      // No args mode — reinstall all from settings
      const { installAllFromSettings } = await import('./install');
      return installAllFromSettings();
    }

    case 'remove': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for remove' };
      }
      const { removeTechPack } = await import('./remove');
      return removeTechPack(validatedArgs.namespace);
    }

    case 'resolve-path': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for resolve-path' };
      }
      if (!validatedArgs.path) {
        return { success: false, error: 'Missing --path argument for resolve-path' };
      }
      const { resolveTechPackPath } = await import('./resolve-path');
      return resolveTechPackPath(validatedArgs.namespace, validatedArgs.path);
    }

    case 'list-components': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for list-components' };
      }
      const { listComponents } = await import('./list-components');
      return listComponents(validatedArgs.namespace);
    }

    case 'dependency-order': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for dependency-order' };
      }
      const { dependencyOrder } = await import('./dependency-order');
      return dependencyOrder(validatedArgs.namespace);
    }

    case 'route-skills': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for route-skills' };
      }
      if (!validatedArgs.phase) {
        return { success: false, error: 'Missing --phase argument for route-skills' };
      }
      const { routeSkills } = await import('./route-skills');
      return routeSkills(validatedArgs.namespace, validatedArgs.phase, validatedArgs.component);
    }

    case 'route-command': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for route-command' };
      }
      if (!validatedArgs.command) {
        return { success: false, error: 'Missing --command argument for route-command' };
      }
      // --action is extracted from named args directly (not through schema validation,
      // since schema.action is the tech-pack action enum 'route-command')
      const cmdAction = named['action'];
      if (!cmdAction) {
        return { success: false, error: 'Missing --action argument for route-command' };
      }
      const { routeCommand } = await import('./route-command');
      return routeCommand(validatedArgs.namespace, validatedArgs.command, cmdAction);
    }

    case 'load-skill': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for load-skill' };
      }
      if (!validatedArgs.skill) {
        return { success: false, error: 'Missing --skill argument for load-skill' };
      }
      const { loadSkill } = await import('./load-skill');
      return loadSkill(validatedArgs.namespace, validatedArgs.skill);
    }

    case 'load-agent': {
      if (!validatedArgs.namespace) {
        return { success: false, error: 'Missing --namespace argument for load-agent' };
      }
      if (!validatedArgs.agent) {
        return { success: false, error: 'Missing --agent argument for load-agent' };
      }
      const { loadAgent } = await import('./load-agent');
      return loadAgent(validatedArgs.namespace, validatedArgs.agent);
    }

    default:
      return { success: false, error: `Unhandled action: ${validatedArgs.action}` };
  }
};
