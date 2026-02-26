# Changelog

All notable changes to the SDD Core plugin.

---

## [0.2.0] - 2026-02-26

### Added

- **7 new tech-pack CLI commands**: resolve-path, list-components, dependency-order, route-skills, route-command, load-skill, load-agent — deterministic replacements for the LLM-interpreted techpacks gateway
- **Shared v2 manifest utility** (`manifest.ts`): typed `V2Manifest` interface, `resolveTechPackDir()`, `readV2Manifest()` used by all namespace-based commands
- **Registry cross-reference validation**: `validate.ts` now checks that all name references in components, phases, help, and commands resolve to skills/agents registries

### Changed

- **techpack.schema.json**: Rewritten for v2 manifest format — flat skills/agents registries, phases (replacing lifecycle), nested command namespaces with actions
- **validate.ts**: Rewritten path validation for registry-based references, added `validateRegistryRefs()`
- **info.ts**: Refactored to use shared `readV2Manifest()`, returns v2 fields (skills_count, agents_count, phases, command namespaces, action_count)
- **13 skill/command files migrated**: All `techpacks.*` gateway invocations replaced with `system-run.sh tech-pack <action>` CLI commands, phase names remapped (component-discovery→spec, plan-generation→planning, testing→verification)

### Removed

- **techpacks gateway skill** (`SKILL.md`, `operations.md`): LLM-interpreted gateway replaced by deterministic CLI
- **3 gateway schemas**: command-router-context, declared-actions-response, skills-router-context — no longer needed with CLI args

---

## [0.1.0] - 2026-02-23

### Added

- **Initial release** extracted from [LiorCohen/sdd](https://github.com/LiorCohen/sdd) v7.3.0
- **3 commands**: `/sdd` (workflow hub), `/sdd-run` (dispatcher), `/sdd-help` (tutor)
- **15 skill sets**: Lifecycle orchestration, spec writing, planning, scaffolding, tech pack management, workflow state
- **System CLI**: Settings validation, reconciliation, tech pack install/info/list/remove/validate
- **Settings schema**: `techpacks` key with `mode: internal | external | git`, top-level `components` map with `techpack` back-reference
- **Git-mode tech pack install**: `tech-pack install --repo <url> [--ref <ref>]` clones into `sdd/.techpacks/<namespace>/`
- **No-args reinstall**: `tech-pack install` (no args) restores all `mode: git` entries from settings
- **Reconciler**: Automatic migration from legacy `tech_packs` key and nested components to current schema

### Lineage

This repo continues the SDD methodology originally developed in the monolithic [LiorCohen/sdd](https://github.com/LiorCohen/sdd) repository (v1.0.0 through v7.3.0). The split separates core methodology from tech-pack implementations, enabling independent versioning and distribution.
