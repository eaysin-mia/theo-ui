# Tasks: Standalone Theo UI Library Architecture in Turborepo

## 1. Turborepo & Workspace Orchestration

- [x] 1.1 Verify and standardize `turbo.json` task pipelines (`build`, `dev`, `lint`, `format`, `typecheck`) with correct inputs, outputs (`dist/**`, `.next/**`), and workspace dependency relationships (`^build`), verifying via `turbo build --dry=json`.
- [x] 1.2 Configure artifact-first development loop: verify `pnpm dev` runs `packages/ui`'s `tsc --watch` concurrently with `apps/web`'s `next dev`, testing live Fast Refresh against `dist/`.
- [x] 1.3 Verify root `package.json` and `pnpm-workspace.yaml` dependencies, ensuring `apps/web` consumes `"@theo/ui": "workspace:*"` and dependency resolution succeeds with `pnpm install`.

## 2. Package Architecture & Directory Structure

- [x] 2.1 Enforce standalone component organization in `packages/ui/src/`: verify core base primitives reside in `src/components/`, bespoke composite patterns in `src/patterns/`, Base UI primitives in `src/base-ui/`, and utilities in `src/lib/`.
- [x] 2.2 Verify zero external dependency on coss: confirm `packages/ui/package.json` contains no external `@coss/*` dependencies and all imports resolve to local `@theo/ui` or Base UI code.

## 3. Build & Packaging Pipeline

- [x] 3.1 Configure `packages/ui/tsconfig.build.json` for unbundled multi-file ESM compilation emitting directly to `dist/`, verifying `"use client"` preservation on client component outputs.
- [x] 3.2 Configure Tailwind CSS v4 CLI compilation script in `packages/ui/package.json` (`tailwindcss -i src/styles/globals.css -o dist/styles.css --minify`) and verify `dist/styles.css` is generated with all theme tokens and animations.
- [x] 3.3 Configure `packages/ui/package.json#exports` subpath maps (`./components/*`, `./patterns/*`, `./base-ui/*`, `./lib/*`, `./hooks/*`, `./styles.css`) and `#imports` internal aliases (`#components/*`, `#patterns/*`, `#lib/*`), validating resolution with `publint`.
- [x] 3.4 Enforce root barrel exclusion for heavy domain modules (Better Auth, Recharts, TanStack Table, Shiki) and verify `peerDependenciesMeta` flags them as `optional: true`.
- [x] 3.5 Set `publishConfig` in `packages/ui/package.json` for private registry distribution and verify files array (`dist`, `README.md`, `THIRD_PARTY_LICENSES.md`).

## 4. Component Pattern Verification & Playground Showcase

- [x] 4.1 Validate Base UI `render` prop composition across interactive primitives (e.g. `Button`, `Dialog`), confirming removal of deprecated `asChild` / `Slot` patterns.
- [x] 4.2 Verify `apps/web` playground imports `@theo/ui` components and stylesheet (`@theo/ui/styles.css`), rendering interactive showcase examples across light and dark modes.
- [x] 4.3 Run full monorepo build, lint, and typecheck via `pnpm build`, `pnpm lint`, and `pnpm typecheck` to verify end-to-end integration.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result in the main specs.
