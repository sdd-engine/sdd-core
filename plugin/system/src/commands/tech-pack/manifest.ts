/**
 * Shared v2 manifest reading utilities.
 *
 * Resolves a tech pack namespace via sdd-settings.yaml, reads the
 * techpack.yaml manifest, and returns typed data. Used by all
 * namespace-based tech-pack commands.
 */

import * as path from 'node:path';
import { join } from 'node:path';
import type { CommandResult } from '@/lib/args';
import { findProjectRoot, getPluginRoot } from '@/lib/config';
import { exists, readText } from '@/lib/fs';
import YAML from 'yaml';

// ── V2 Manifest Types ──────────────────────────────────────────

type TechPackIdentity = {
  readonly name: string;
  readonly namespace: string;
  readonly description: string;
  readonly version: string;
  readonly min_sdd_version: string;
  readonly system_path: string;
};

type CommandArg = {
  readonly type: string;
  readonly mandatory: boolean;
  readonly description: string;
  readonly default?: unknown;
};

type CommandAction = {
  readonly description: string;
  readonly public: boolean;
  readonly destructive?: boolean;
  readonly args?: Readonly<Record<string, CommandArg>>;
};

type CommandNamespace = {
  readonly handler: string;
  readonly skill?: string;
  readonly actions: Readonly<Record<string, CommandAction>>;
};

type Phase = {
  readonly orchestrator_skills: readonly string[];
  readonly agents?: readonly string[];
};

type Component = {
  readonly singleton?: boolean;
  readonly description: string;
  readonly directory_pattern: string;
  readonly depends_on: readonly string[];
  readonly scaffolding: string;
  readonly skills: readonly string[];
  readonly agent?: string;
};

type Help = {
  readonly capabilities: string;
  readonly content: string;
};

export type V2Manifest = {
  readonly techpack: TechPackIdentity;
  readonly skills: Readonly<Record<string, string>>;
  readonly agents: Readonly<Record<string, string>>;
  readonly components: Readonly<Record<string, Component>>;
  readonly phases: Readonly<Record<string, Phase>>;
  readonly help: Help;
  readonly commands: Readonly<Record<string, CommandNamespace>>;
};

// Re-export component/phase/command types for consumers
export type { Component, Phase, CommandNamespace, CommandAction, CommandArg };

// ── Settings Entry Type ─────────────────────────────────────────

type TechPackEntry = {
  readonly name: string;
  readonly namespace: string;
  readonly version: string;
  readonly mode: string;
  readonly path: string;
  readonly install_path?: string;
  readonly repo?: string;
  readonly ref?: string;
};

// ── Resolution Utilities ────────────────────────────────────────

/** Resolve the absolute path to a tech pack directory. */
const resolveDir = (entry: TechPackEntry, projectRoot: string): string => {
  if (entry.mode === 'internal') {
    return join(getPluginRoot(), entry.path);
  }
  if (entry.mode === 'git' && entry.install_path) {
    return join(projectRoot, entry.install_path);
  }
  return path.resolve(entry.path);
};

/**
 * Resolve a tech pack namespace to its directory path.
 * Returns { success: true, data: { techPackDir, entry } } or error.
 */
export const resolveTechPackDir = async (
  namespace: string
): Promise<CommandResult> => {
  const projectRootResult = await findProjectRoot();
  if (!projectRootResult.found) {
    return { success: false, error: 'Not in an SDD project (no sdd/ or package.json found)' };
  }
  const projectRoot = projectRootResult.path;

  // Try new sdd/ location first, fall back to .sdd/
  let settingsPath = join(projectRoot, 'sdd', 'sdd-settings.yaml');
  if (!(await exists(settingsPath))) {
    settingsPath = join(projectRoot, '.sdd', 'sdd-settings.yaml');
  }

  if (!(await exists(settingsPath))) {
    return { success: false, error: 'sdd-settings.yaml not found' };
  }

  const content = await readText(settingsPath);
  const settings = YAML.parse(content) as Record<string, unknown>;
  const techPacks = (settings['techpacks'] as Record<string, TechPackEntry> | undefined) ?? {};

  const entry = techPacks[namespace];
  if (!entry) {
    return { success: false, error: `Tech pack "${namespace}" not found in settings` };
  }

  const techPackDir = resolveDir(entry, projectRoot);
  return { success: true, data: { techPackDir, entry } };
};

/**
 * Read and parse a v2 manifest for the given namespace.
 * Returns { success: true, data: { manifest, techPackDir } } or error.
 */
export const readV2Manifest = async (
  namespace: string
): Promise<CommandResult> => {
  const dirResult = await resolveTechPackDir(namespace);
  if (!dirResult.success) {
    return dirResult;
  }

  const { techPackDir } = dirResult.data as { techPackDir: string };
  const manifestPath = join(techPackDir, 'techpack.yaml');

  if (!(await exists(manifestPath))) {
    return { success: false, error: `techpack.yaml not found at ${manifestPath}` };
  }

  const manifestContent = await readText(manifestPath);
  const manifest = YAML.parse(manifestContent) as V2Manifest;

  return { success: true, data: { manifest, techPackDir } };
};
