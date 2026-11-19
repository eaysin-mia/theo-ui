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

### 1. Modular Compilation Pipeline (`build:js` + `build:css`)
- **Decision**: Define `"build:js": "tsc -p tsconfig.build.json"`, `"build:css": "tailwindcss -i src/styles/globals.css -o dist/styles.css --minify"`, and `"build": "pnpm build:js && pnpm build:css"`. Completely delete legacy `scripts/build.mjs`.
- **Rationale**: Follows official Turborepo `with-tailwind` conventions by cleanly separating component compilation (`tsc`) from stylesheet compilation (`tailwindcss`). This produces type-safe JS/DTS in `dist/` and an optimized, production-ready `dist/styles.css`.
- **Alternatives Considered**:
  - Chaining commands into one brittle shell string: Harder to debug and maintain.
  - Using a custom Node script (`build.mjs`): Unnecessary maintenance overhead.

### 2. Single Authoritative Stylesheet: `src/styles/globals.css`
- **Decision**: Retain `src/styles/globals.css` as the single source stylesheet matching the shadcn `components.json` CLI configuration (`"css": "src/styles/globals.css"`).
- **Rationale**: Eliminates having multiple conflicting stylesheets (`theme.css`, `styles.css`, `globals.css`). The single `globals.css` file contains `@import "tailwindcss"`, `@custom-variant dark`, and the complete `@theme inline` design tokens.

### 3. Pre-Compiled Zero-Config Stylesheet Export
- **Decision**: Export `./styles.css` pointing to `./dist/styles.css` (with backwards-compatible `./globals.css` and `./theme.css` aliases).
- **Rationale**: The industry-standard approach for published npm component libraries. Consuming applications (Vite, Next.js, etc.) simply write `@import "@workspace/ui/styles.css";` and immediately receive all required styling without configuring `@source`, without declaring `node_modules` paths in CSS, and without needing Tailwind installed in the consuming project.
- **Alternatives Considered**:
  - Requiring consumers to write `@source "../node_modules/@workspace/ui"`: Brittle, exposes package manager internal directory layouts, and degrades developer experience.

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
