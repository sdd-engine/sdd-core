# CLAUDE.md

## Repository Structure

```
sdd-core/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace manifest (version source of truth)
├── .github/
│   └── workflows/
│       └── release.yml           # Version-triggered release workflow
├── plugin/
│   ├── .claude-plugin/
│   │   └── plugin.json           # Plugin manifest (commands + skills)
│   ├── commands/                  # User-facing slash commands
│   │   ├── sdd.md                # /sdd — context-aware workflow hub
│   │   ├── sdd-run.md            # /sdd-run — direct operations dispatcher
│   │   └── sdd-help.md           # /sdd-help — read-only tutor
│   ├── skills/                    # Lifecycle skills (orchestrators, tech packs, etc.)
│   ├── system/                    # TypeScript CLI (settings, tech-pack management)
│   │   ├── src/                   # Source files
│   │   ├── dist/                  # Built output (gitignored)
│   │   ├── package.json           # @sdd/core-system workspace
│   │   ├── tsconfig.json
│   │   └── system-run.sh          # CLI entry point
│   └── permissions/               # Permission configuration
├── docs/                          # User-facing documentation
├── package.json                   # Root workspace config
├── CHANGELOG.md
├── README.md
└── LICENSE
```

## Build Rules

- **Always use root `package.json` scripts** — never `cd` into plugin/system:
  - `npm run build` — build system CLI (`tsc + tsc-alias`)
  - `npm run typecheck` — type-check without emitting
- **NEVER run `npx tsc` directly** — the build requires `tsc-alias` to resolve `@/` path aliases

## Plugin Boundary Rule

Files inside `plugin/` have **no runtime access** to anything outside `plugin/`. The plugin is a self-contained unit.

## Tech Pack Integration

This is the core-only repo. It contains no tech-pack-specific content. Tech packs are installed via:
- `tech-pack install --repo <url>` — git-based installation
- `tech-pack install --path <dir>` — local directory installation
