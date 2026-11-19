# Proposal: Standalone Theo UI Architecture & Packaging Strategy

## Why

Building an enterprise-grade, publishable UI component library (`@theo/ui`) requires resolving four foundational architectural dilemmas: compilation strategy, Tailwind CSS v4 distribution, heavy domain dependency management, and monorepo developer experience. Establishing unbundled multi-file ESM compilation, a dual-distribution styling model, strict root-barrel exclusion with isolated subpaths, and an artifact-first live dev loop ensures `@theo/ui` achieves optimal tree-shaking, zero external framework coupling (zero coss runtime dependencies), and seamless consumption across modern Next.js and React applications.

## What Changes

- **Monorepo DX & Orchestration**: Configure Turborepo pipelines (`turbo.json`) and pnpm workspaces for artifact-first development, where `packages/ui` compiles to `dist/` via `tsc --watch` and `apps/web` consumes compiled artifacts live.
- **Unbundled Multi-File ESM Compilation**: Standardize compilation on `tsc -p tsconfig.build.json` emitting 1-to-1 unbundled ESM and declaration files to `dist/`, preserving `"use client"` directives at the top of client component files.
- **Tailwind CSS v4 Dual Distribution Model**: Pre-compile `dist/styles.css` using `@tailwindcss/cli` for zero-config consumer integration (`@import "@theo/ui/styles.css";`), while maintaining semantic `@theme inline` CSS variable tokens for runtime theming.
- **Strict Root-Exclusion & Isolated Subpaths**: Keep the root entry point (`.`) lightweight with core primitives only, isolating heavy domain modules (Better Auth, Recharts, TanStack Table, Shiki, Gantt, Kanban) in dedicated subpaths with optional peer dependencies.
- **Self-Contained Library Identity**: Ensure `@theo/ui` is 100% standalone with zero external `@coss/*` dependencies; coss UI patterns are purely internal in-tree scaffolding.
- **Base UI Primitive Composition**: Standardize element composition on Base UI's native `render` prop (`<Button render={<Link href="..." />}>`), eliminating legacy `asChild` / `Slot` patterns.

## Capabilities

### New Capabilities

- `turborepo-workspace-architecture`: Defines Turborepo task pipelines, caching targets, and artifact-first live workspace linking between `apps/web` and `@theo/ui`.
- `coss-component-composition-patterns`: Defines the component hierarchy, Base UI primitive integration, `@theo/ui` design token adherence, trigger/popup composition rules, and `render` prop element delegation.

### Modified Capabilities

- `component-library-packaging`: Expands unbundled ESM compilation, `"use client"` preservation, root-exclusion rules, optional peer dependencies, `#imports` resolution, and private registry publishing.
- `design-tokens-and-styling`: Expands the Tailwind CSS v4 dual-distribution model, pre-compiled `dist/styles.css`, semantic `@theme inline` CSS variable contracts, and class-based dark mode.

## Impact

- **Monorepo**: Root `package.json`, `turbo.json`, pnpm workspaces setup.
- **`packages/ui`**: `package.json` (`@theo/ui`), `tsconfig.build.json`, `src/` directory organization, build scripts (`build:js`, `build:css`), `peerDependenciesMeta`.
- **`apps/web`**: Playground consumer configuration, subpath imports, stylesheet integration, and interactive preview routes.
- **Downstream Consumers**: Zero-config imports from `@theo/ui` and `@theo/ui/styles.css`, with zero external coss dependencies.
