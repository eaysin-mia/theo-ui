# Design

## Context

The repository contains two GitHub Actions workflows:
1. `.github/workflows/ci.yml`: Runs on pushes and PRs to `main` and `build`. Currently runs lint, format check, typecheck, build, and package check in a single sequential job.
2. `.github/workflows/release.yml`: Runs on pushes to `main` using `@changesets/action` to create version PRs or publish `@theo/ui` to GitHub Packages.

CI consistently fails across commits due to two primary bugs:
1. `pnpm format:check` fails because `prettier --check .` scans 23 non-code/markdown files (e.g. `openspec/changes/archive/`, `pnpm-workspace.yaml`, `.gemini/`) that are not ignored in `.prettierignore`.
2. The package check step calls `pnpm --filter @workspace/ui run package:check --if-present`. The package name is `@theo/ui`, not `@workspace/ui`, causing this check to silently match 0 workspace projects or fail.

## Goals / Non-Goals

**Goals:**
- Eliminate all false-positive CI failures so commits and pull requests pass reliably.
- Scope formatting strictly to application and package source files.
- Fix package check filter to accurately test `@theo/ui` via `publint`.
- Optimize CI execution time using pnpm store caching, Turborepo pipeline caching, and concurrency controls (`cancel-in-progress: true`).
- Ensure the release workflow has appropriate token permissions and parameters to publish to GitHub Packages.

**Non-Goals:**
- Setting up third-party paid remote caches (e.g. Vercel Remote Cache) in this change.
- Migrating away from Changesets or pnpm.

## Decisions

### Decision 1: Scoping Prettier via `.prettierignore`

We add explicit exclusions to `.prettierignore`:
- `openspec/` (OpenSpec changes, specs, and archives have custom formatting and markdown structures that should not fail codebase CI)
- `pnpm-workspace.yaml` (YAML files with non-standard formatting)
- `.gemini/`, `.agents/`
- `skills-lock.json`
- `*.md` files outside package source if necessary

*Rationale*: A CI format check should ensure that TypeScript, TSX, CSS, and core config files follow repository conventions. It should never fail because an OpenSpec artifact was archived or a workspace manifest was updated.

### Decision 2: Correcting Package Filter Target in CI

Update line 42 of `.github/workflows/ci.yml`:
```yaml
- name: Package check
  run: pnpm --filter @theo/ui run package:check
```
*Rationale*: `@theo/ui` is the canonical package name in `packages/ui/package.json`. Testing the actual published package ensures zero regression in exports or types before merging.

### Decision 3: Workflow Concurrency and Runner Optimization

Ensure both `ci.yml` and `release.yml` configure:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
This automatically cancels redundant runs when multiple commits are pushed in rapid succession, saving GitHub Actions compute minutes and queue times.

## Risks / Trade-offs

- **Risk**: Ignoring `openspec/` in Prettier might allow unformatted Markdown in archive files.
- **Mitigation**: OpenSpec CLI formats its own generated YAML and Markdown files; ignoring it in Prettier prevents syntax differences between Prettier and OpenSpec from breaking CI.
