# Tasks

## 1. Prettier Scoping & Format Hardening

- [x] 1.1 Update `.prettierignore` to exclude `openspec/`, `pnpm-workspace.yaml`, `.gemini/`, and `skills-lock.json` from generic format checks.
- [x] 1.2 Run `pnpm format:check` and verify that the format check passes cleanly without errors.

## 2. CI Workflow Optimization

- [x] 2.1 Update `.github/workflows/ci.yml` to target `@theo/ui` for the package check (`pnpm --filter @theo/ui run package:check`).
- [x] 2.2 Configure concurrency controls (`cancel-in-progress: true`) and verify step order and error reporting in `.github/workflows/ci.yml`.

## 3. Release Workflow Validation

- [x] 3.1 Verify permissions (`contents: write`, `packages: write`, `pull-requests: write`) and registry URL configuration in `.github/workflows/release.yml`.
- [x] 3.2 Verify Changesets publish configuration against the `@theo/ui` package manifest.

## 4. Full Pipeline Verification

- [x] 4.1 Run the complete CI verification suite locally (`turbo lint`, `pnpm format:check`, `turbo typecheck`, `turbo build`, `pnpm --filter @theo/ui run package:check`) and confirm all checks exit with code 0.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
