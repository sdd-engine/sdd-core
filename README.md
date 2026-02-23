# SDD Core

Tech-agnostic core of the [Spec-Driven Development](https://github.com/sdd-engine) methodology for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

SDD Core provides the lifecycle framework — commands, skills, and orchestrators — that guide AI-assisted development through structured phases: spec, plan, implement, verify. Tech packs (like [sdd-fullstack-typescript-techpack](https://github.com/sdd-engine/sdd-fullstack-typescript-techpack)) plug into this core to provide language-specific agents, templates, and tooling.

## Quick Start

Install as a Claude Code plugin:

```bash
claude plugins add sdd-engine/sdd-core
```

Then initialize a project:

```
/sdd-run init
```

## What's Included

- **3 Commands**: `/sdd` (workflow hub), `/sdd-run` (direct operations), `/sdd-help` (tutor)
- **15 Skills**: Lifecycle orchestration, spec writing, planning, scaffolding, tech pack management
- **System CLI**: Settings validation, reconciliation, tech pack install/info/list/remove

## Tech Packs

SDD Core is tech-agnostic. To add language-specific capabilities, install a tech pack:

```bash
/sdd-run tech-pack install --repo https://github.com/sdd-engine/sdd-fullstack-typescript-techpack
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Commands Reference](docs/commands.md)
- [Workflows](docs/workflows.md)
- [Tutorial](docs/tutorial.md)
- [External Specs](docs/external-specs.md)

## Development

```bash
npm install
npm run build      # Build system CLI
npm run typecheck   # Type-check without emitting
```

## Lineage

This repo was extracted from [LiorCohen/sdd](https://github.com/LiorCohen/sdd) at v7.3.0. The monolithic plugin was split into independent repos under the [sdd-engine](https://github.com/sdd-engine) organization.

## License

MIT
