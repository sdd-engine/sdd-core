# Contributing to SDD Core

## Development Setup

```bash
git clone https://github.com/sdd-engine/sdd-core.git
cd sdd-core
npm install
npm run build
```

## Making Changes

1. Create a feature branch: `git checkout -b feature/my-change`
2. Make changes in `plugin/` (commands, skills, system)
3. Build and verify: `npm run build && npm run typecheck`
4. Commit with a clear message describing the change
5. Open a pull request

## Versioning

Version is tracked in two files that must always match:
- `plugin/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

- **PATCH** (x.x.Z): Bug fixes, small improvements
- **MINOR** (x.Y.0): New features, backwards compatible
- **MAJOR** (X.0.0): Breaking changes

## Code Standards

- TypeScript strict mode with all strict checks enabled
- Path aliases use `@/` prefix (resolved by `tsc-alias`)
- Prefer `readonly` types and immutable patterns
- No unused locals or parameters (`noUnusedLocals`, `noUnusedParameters`)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
