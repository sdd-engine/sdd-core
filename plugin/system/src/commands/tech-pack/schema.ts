import type { CommandSchema } from '@/lib/schema-validator';

export const ACTIONS = [
  'validate',
  'list',
  'info',
  'install',
  'remove',
  'resolve-path',
  'list-components',
  'dependency-order',
  'route-skills',
  'route-command',
  'load-skill',
  'load-agent',
] as const;
type Action = (typeof ACTIONS)[number];

export const schema: CommandSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ACTIONS,
      description: 'Tech pack action to perform',
    },
    path: {
      type: 'string',
      description: 'Path to tech pack directory (for validate/install) or relative path (for resolve-path)',
      minLength: 1,
    },
    namespace: {
      type: 'string',
      description: 'Tech pack namespace',
      minLength: 1,
    },
    repo: {
      type: 'string',
      description: 'Git repository URL (for install)',
      minLength: 1,
    },
    ref: {
      type: 'string',
      description: 'Git ref to checkout — tag, branch, or commit SHA (for install)',
      minLength: 1,
    },
    skill: {
      type: 'string',
      description: 'Skill name from the skills registry (for load-skill)',
      minLength: 1,
    },
    agent: {
      type: 'string',
      description: 'Agent name from the agents registry (for load-agent)',
      minLength: 1,
    },
    phase: {
      type: 'string',
      description: 'Lifecycle phase name (for route-skills)',
      minLength: 1,
    },
    component: {
      type: 'string',
      description: 'Component type name (for route-skills)',
      minLength: 1,
    },
    command: {
      type: 'string',
      description: 'Command namespace key (for route-command)',
      minLength: 1,
    },
  },
  required: ['action'],
} as const;

export type TechPackArgs = {
  readonly action: Action;
  readonly path?: string;
  readonly namespace?: string;
  readonly repo?: string;
  readonly ref?: string;
  readonly skill?: string;
  readonly agent?: string;
  readonly phase?: string;
  readonly component?: string;
  readonly command?: string;
};
