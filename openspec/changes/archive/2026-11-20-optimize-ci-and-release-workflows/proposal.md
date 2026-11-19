# Proposal

## Why

The current GitHub Actions CI workflow consistently fails on pushes and pull requests due to brittle format checks that fail on non-code artifacts (e.g. OpenSpec archive files and pnpm workspace manifests), misconfigured package filter targets (`@workspace/ui` instead of `@theo/ui`), unoptimized sequential execution, and lack of build caching. Modern open-source monorepos require resilient, fast, and deterministic CI and release automation to guarantee package health, prevent regressions, and automate changesets releases.

## What Changes

- Scope Prettier format checks in `.prettierignore` to ignore non-code artifacts (`openspec/`, `pnpm-workspace.yaml`, `.gemini/`, lockfiles) so format checks test source code without tripping on documentation or data files.
- Fix the package check step in `.github/workflows/ci.yml` to target `@theo/ui` (`pnpm --filter @theo/ui run package:check`) instead of the non-existent `@workspace/ui`.
- Optimize the CI pipeline structure to leverage parallel job stages (or optimized Turborepo pipeline caching) and explicit dependency caching.
- Add workflow concurrency controls and permission definitions so CI cancels redundant runs on rapid pushes.
- Align the Changeset release workflow in `.github/workflows/release.yml` with the repository's GitHub Packages publishing contract.

## Capabilities

### New Capabilities
<!-- No new standalone capabilities -->

### Modified Capabilities
- `turborepo-workspace-architecture`: Adds requirements for automated CI verification pipelines and release workflows.

## Impact

- **CI Workflows**: Modifies `.github/workflows/ci.yml` and `.github/workflows/release.yml`.
- **Formatting Configuration**: Updates `.prettierignore` to exclude non-source files from breaking the format gate.
- **Developer Velocity**: CI passes deterministically and runs significantly faster with parallel verification jobs.
