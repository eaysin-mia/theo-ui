# Tasks

## 1. Audit and Manifest Verification

- [x] 1.1 Audit `packages/ui/package.json` to confirm `peerDependencies` strictly marks `react` and `react-dom` as required, and `motion`, `recharts`, `shiki`, `@tanstack/react-table`, `better-auth`, `@better-auth-ui/core`, `@better-auth-ui/react`, and `qrcode` under `peerDependenciesMeta` with `optional: true`.
- [x] 1.2 Audit `packages/ui/src/index.ts` to confirm no optional peer-dependent modules or components are imported or re-exported from the root entry point.

## 2. Documentation and Installation Recipes

- [x] 2.1 Refactor the primary installation section in `packages/ui/README.md` to establish the lean core install (`pnpm add @theo/ui`, `npm i @theo/ui`, `yarn add @theo/ui`, `bun add @theo/ui`) without bundling or mandating `motion`.
- [x] 2.2 Structure the "Optional Dependencies & Feature Recipes" section in `packages/ui/README.md` with explicit, copy-pasteable installation blocks for Motion, Authentication, Data Tables, Charts, Syntax Highlighting, and QR Codes.
- [x] 2.3 Add informative JSDoc comments to `AutoHeight`, `CartButton`, `HoldButton`, `UndoButton`, `HaloSearchInput`, and `TipSelector` indicating their optional peer dependency on `motion`.

## 3. Build & Packaging Validation

- [x] 3.1 Run `pnpm --filter @theo/ui build` and verify that the unbundled ESM distribution and types build cleanly.
- [x] 3.2 Execute `pnpm --filter @theo/ui package:check` (`publint`) to verify that all subpath exports and peer dependency declarations adhere to strict packaging standards.
- [x] 3.3 Run `pnpm typecheck` to confirm end-to-end type safety across the monorepo.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
