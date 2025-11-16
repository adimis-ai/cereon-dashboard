
# Contributing to @cereon/dashboard

Thank you for your interest in contributing! This document explains how to set up a local development environment, run tests and linters, follow commit conventions, and publish releases for the `@cereon/dashboard` package.

## Quick start (local development)

Prerequisites:
- Node.js 20+ (use nvm to manage versions)
- pnpm (this monorepo uses pnpm workspace tooling)

1. From the repository root:
	- Install workspace dependencies: `pnpm install`
	- Start a dev server for the demo client: `pnpm --filter cereon-demo-client dev`

2. Work inside `packages/cereon-dashboard`:
	- Build: `pnpm --filter @cereon/dashboard build`
	- Run type checks: `pnpm --filter @cereon/dashboard -w tsc --noEmit`

3. Storybook / Demo
	- The repository includes a `cereon-demo-client` project for manual testing and integration. Use it to exercise cards and UI components.

## Linting & formatting

- Formatting: Prettier (configured at the repo root). Run `pnpm -w prettier --write .` to format files.
- Linting: ESLint for TypeScript/React. Run `pnpm -w eslint "**/*.{ts,tsx}"`.
- Type checking: `pnpm -w tsc -p tsconfig.json`.

Follow existing ESLint and TypeScript rules. If you need to adjust lint rules, open a PR explaining the reason and add test coverage for the change where applicable.

## Tests

- Unit tests: run `pnpm --filter @cereon/dashboard test`.
- CI: Pull requests must include passing CI checks. Add unit tests for bug fixes and new features.

Test guidance:
- Keep tests fast and deterministic.
- Mock network calls and timers.

## Commits & PRs

- Use conventional commits (type(scope): subject) to keep changelogs clean. Example: `feat(cards): add reorder support`.
- Open a pull request against `main` (or the repo's default branch) with a clear description and links to relevant issues.
- Make small, focused PRs. Split large work into multiple PRs when possible.

## Release & publishing

This monorepo uses pnpm workspaces. Releases are managed centrally (e.g., via a release workflow such as semantic-release or a manual release process).

To publish a local package build (for testing):

1. Build the package: `pnpm --filter @cereon/dashboard build`
2. Pack the package locally: `pnpm --filter @cereon/dashboard pack`
3. Install the produced tarball in a consuming project for manual testing.

For official releases, follow the repository's release process (see root README and release workflow files). Coordinate with the maintainers for publishing to npm.

## Developer notes

- Keep API surface stable and well-typed. Add or update TypeScript declaration tests where applicable.
- Add documentation pages under `packages/cereon-dashboard/docs` for any new public components or APIs.

Thanks for contributing — we appreciate your help making Cereon better!
