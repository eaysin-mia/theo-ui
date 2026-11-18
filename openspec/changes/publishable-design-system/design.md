# Design

## Context

The repository is a Turborepo monorepo consisting of:
- `packages/ui`: The shared UI library built on `@base-ui/react`, Tailwind CSS v4, and coss ui component patterns. It also integrates specialized domain modules, notably Better Auth UI (`src/components/auth`, `src/lib/auth`) and complex interactive widgets (`gantt`, `kanban`, `event-calendar`, `chart`, `tree`).
- `apps/web`: A Next.js 16 (React 19) web application acting as the showcase, playground, and primary consumer.
- `packages/typescript-config` and `packages/eslint-config`: Shared workspace configurations.

Previously, `packages/ui` used a custom `scripts/build.mjs` script, `tsc-alias`, and duplicate stylesheets (`globals.css` and `theme.css`). See `proposal.md` for the core motivation.

## Goals / Non-Goals

**Goals:**
- Establish a reproducible, pure `tsc -p tsconfig.build.json` compilation pipeline without custom `.mjs` scripts or bundler wrappers.
- Ship `src/styles/theme.css` directly as source, eliminating the duplicate legacy `globals.css` file and avoiding unnecessary script-based copying.
- Transition internal aliases to standard Node subpath imports (`#components/*`, `#patterns/*`, `#hooks/*`, `#lib/*`, `#base-ui/*`) targeting `dist/`.
- Organize source into distinct origins: `src/components/` (upstream coss primitives managed by shadcn CLI), `src/components/auth/` & `src/lib/auth/` (Better Auth UI integrations), and `src/patterns/` (custom internal components).
- Modularize domain-specific feature modules (`auth`, `gantt`, `chart`) into isolated subpath exports backed by optional peer dependencies.
- Export granular entry points per component, alongside Base UI re-exports (`./base-ui/*`).
- Configure Changesets for semantic versioning, private/restricted npm publishing, and GitHub Actions CI/CD.

**Non-Goals:**
- Generating dual CommonJS (CJS) bundles. The library targets modern ESM-native environments (Next.js App Router, Vite).
- Shipping pre-compiled CSS with Tailwind utilities included. Consumers maintain their own Tailwind v4 processing pipeline.
- Maintaining multiple or duplicate theme stylesheets in the library package.

## Decisions

### 1. Pure `tsc` Compilation & Deletion of `scripts/build.mjs`
- **Decision**: Define `"build": "tsc -p tsconfig.build.json"` and completely delete `scripts/build.mjs`.
- **Rationale**: `scripts/build.mjs` was a legacy workaround to run `tsc-alias` and copy `globals.css` to `dist/`. Since CSS is now exported directly from source (`"./theme.css": "./src/styles/theme.css"`), and subpath imports (`#...`) require no alias re-writing, `tsc` alone is sufficient to build all `.ts`/`.tsx` files.
- **Alternatives Considered**:
  - Keeping `scripts/build.mjs` to copy CSS: Adds maintenance overhead and an extra process layer with zero benefit over direct source export.

### 2. Single Authoritative Stylesheet: `src/styles/globals.css`
- **Decision**: Retain `src/styles/globals.css` as the unique, authoritative design system stylesheet matching the shadcn `components.json` CLI configuration (`"css": "src/styles/globals.css"`). Export it via `package.json#exports` as `"./globals.css": "./src/styles/globals.css"` (with `"./theme.css"` alias for backward compatibility).
- **Rationale**: Eliminates having two conflicting stylesheets (`globals.css` and `theme.css`) with duplicate `:root`, `.dark`, and `@theme inline` definitions. Standardizing on `globals.css` keeps the package aligned with shadcn CLI contracts.
- **Alternatives Considered**:
  - Renaming to `theme.css`: Breaks shadcn CLI expectations unless `components.json` is remapped, and causes confusion for consumers accustomed to standard shadcn conventions.

### 3. Encapsulated Tailwind CSS v4 `@source` Inside `globals.css`
- **Decision**: Declare `@source "../";` and `@source "../../dist";` directly inside `packages/ui/src/styles/globals.css`.
- **Rationale**: In Tailwind CSS v4, `@source` directives declared inside imported library stylesheets resolve relative to that stylesheet. This completely frees consumer applications (`apps/web` and external apps) from writing awkward, brittle relative paths like `@source "../node_modules/@workspace/ui/dist"`. Consumers simply write `@import "@workspace/ui/globals.css";`, and Tailwind v4 automatically scans the library components both in local monorepo development (`../`) and when consumed via npm (`../../dist`).
- **Alternatives Considered**:
  - Forcing every consumer to write `@source "../node_modules/@workspace/ui/dist"`: Brittle, leaks internal folder layouts to consumers, and creates confusion between `src` and `dist` paths.

### 4. Node Subpath Imports (`#...`) Over TSConfig Paths
- **Decision**: Define `#components/*`, `#patterns/*`, `#hooks/*`, and `#lib/*` in `package.json#imports` pointing to `./dist/*.js`.
- **Rationale**: Subpath imports are a standard ECMAScript / Node feature supported by modern bundlers (Next.js Turbopack/webpack, Vite) and shadcn CLI. The emitted JS requires no path rewriting.

### 5. Domain Feature Modularization & Optional Peer Dependencies
- **Decision**: Expose dedicated subpath exports for domain features:
  - `./components/auth` and `./components/auth/*`: UI components (Auth, SignIn, SignUp, Organization, Settings).
  - `./lib/auth` and `./lib/auth/*`: Better Auth client plugins and configuration helpers.
  - Root entry point (`.`): Re-exports core primitives and utilities, but strictly **excludes** `auth` and heavy domain modules.
  - Reclassify heavy domain dependencies as `peerDependencies` with `peerDependenciesMeta: { "...": { "optional": true } }`, maintaining concrete versions in `devDependencies`.
- **Rationale**: Consumers using core UI components are not forced to install auth or charting ecosystems, while consumers requiring authentication get fully typed, dedicated subpath entry points.

### 6. Granular Exports and Base UI Re-exports
- **Decision**: Expose fine-grained subpaths in `package.json#exports` (`./components/*`, `./patterns/*`, `./base-ui/*`, `./lib/*`, `./hooks/*`, `./theme.css`) and configure `sideEffects: ["**/*.css"]`. Re-export Base UI primitives (`./base-ui/use-render`, `./base-ui/merge-props`).

### 7. Changesets and CI/CD Automation
- **Decision**: Use `@changesets/cli` with `"access": "restricted"` in `.changeset/config.json` and a GitHub Actions workflow (`ci.yml`, `release.yml`).

## Risks / Trade-offs

- **[Risk] Consumer forgets `@source` in their CSS**:
  - *Mitigation*: Clearly document `@source` requirement in `packages/ui/README.md` with copy-paste examples.
- **[Risk] Relative `@source` path in monorepos vs external npm consumers**:
  - *Mitigation*: In external consumers, `@source "../node_modules/@workspace/ui/dist"` or source. In monorepo consumers, `@source "../node_modules/@workspace/ui/dist"` works through the pnpm symlink.

## Migration Plan

1. **Delete Redundancies**: Remove `packages/ui/src/styles/globals.css` and delete `packages/ui/scripts/build.mjs`.
2. **Package Config**: Update `packages/ui/package.json` build script to `"build": "tsc -p tsconfig.build.json"` and map `"./theme.css": "./src/styles/theme.css"`.
3. **Verification**: Run `pnpm turbo build lint typecheck` and `package:check`.
