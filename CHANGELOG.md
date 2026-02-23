# Changelog

All notable changes to the SDD Core plugin.

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
