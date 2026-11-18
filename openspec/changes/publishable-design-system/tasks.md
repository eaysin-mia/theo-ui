# Tasks

## 1. Tooling & Workspace Configuration

- [x] 1.1 Update `packages/typescript-config` (`base.json` and `react-library.json`) to enforce `declaration: true`, `declarationMap: true`, and standard ESM/NodeNext compiler settings; verify type checking passes across workspaces.
- [x] 1.2 Initialize Changesets at workspace root (`pnpm add -D -w @changesets/cli && pnpm changeset init`), configure `.changeset/config.json` with `"access": "restricted"` and `"baseBranch": "main"`, and verify changeset commands run without errors.
- [x] 1.3 Add GitHub Actions workflows (`.github/workflows/ci.yml` and `.github/workflows/release.yml`) for automated linting, type checking, tests, packaging verification, and Changesets release publication; verify workflow syntax.

## 2. Directory Reorganization & Asset Isolation

- [x] 2.1 Create `packages/ui/src/patterns/` directory to house custom internal components separately from CLI-vendored components in `src/components/`, and create `COSS_SYNC.md` and `THIRD_PARTY_LICENSES.md` to document upstream provenance and sync instructions.
- [x] 2.2 Create `packages/ui/src/base-ui/` re-exports (`use-render.ts`, `merge-props.ts`) exporting headless primitives from `@base-ui/react`; verify each re-export module compiles with accurate type definitions.
- [x] 2.3 Establish `packages/ui/src/styles/globals.css` as the single authoritative stylesheet, consolidating tokens and theme variables, and verify CSS syntax.
- [x] 2.4 Update `packages/ui/components.json` to configure `"css": "src/styles/globals.css"`, subpath aliases (`#components`, `#lib`, `#hooks`, `#patterns`), and pin `@coss` and `@better-auth-ui` registry endpoints; verify `shadcn` CLI resolves paths correctly.

## 3. Packaging, Subpath Imports & Build Pipeline

- [x] 3.1 Reclassify domain-heavy dependencies (`better-auth`, `@better-auth-ui/core`, `@better-auth-ui/react`, `recharts`, `@tanstack/react-table`, `@headless-tree/core`, `motion`, `qrcode`, `shiki`, `culori`, `bowser`) as `peerDependencies` with `peerDependenciesMeta: { optional: true }`, maintaining core dependencies minimal in `dependencies` and concrete versions in `devDependencies`.
- [x] 3.2 Update `packages/ui/package.json` to define standard Node `imports` (`#components/*`, `#patterns/*`, `#hooks/*`, `#lib/*`), map `"./globals.css": "./src/styles/globals.css"` (with `"./theme.css"` alias), and set `sideEffects: ["**/*.css"]`; verify package manifest validity.
- [x] 3.3 Delete `packages/ui/scripts/build.mjs` and update `packages/ui/package.json` to compile directly with `"build": "tsc -p tsconfig.build.json"`; verify `pnpm --filter @workspace/ui build` emits clean JS and types to `dist/`.
- [x] 3.4 Add `publint` and `@arethetypeswrong/cli` to `packages/ui` devDependencies and add a `package:check` script; run verification to confirm all exported subpaths, auth modules, and types resolve properly under Node and bundler profiles.

## 4. Consumer Application (`apps/web`) Integration & Verification

- [x] 4.1 Update `apps/web` CSS to import `@workspace/ui/globals.css` after `@import "tailwindcss"` with encapsulated `@source` handling; verify Tailwind v4 scans classes and builds without manual `@source` directives.
- [x] 4.2 Verify `apps/web/app/layout.tsx` maintains the required `isolate relative min-h-svh flex-col` portal stacking wrapper and satisfies font variable bindings (`--font-sans`, `--font-mono`); verify layout renders without styling regressions.
- [x] 4.3 Verify that `apps/web` authentication flows (login, signup, organization, settings pages) and auth client provider resolve cleanly from `@workspace/ui/components/auth` and `@workspace/ui/lib/auth` without circular imports or bundler errors.
- [x] 4.4 Run end-to-end workspace verification via `pnpm turbo build lint typecheck`; confirm Next.js build succeeds with zero transpile issues or `"use client"` boundary failures.

## Workflow follow-up

- Archive the change after implementation and verification are complete.
