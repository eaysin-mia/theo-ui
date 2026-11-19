# Design

## Context

`@theo/ui` is an ESM-first UI library built on Base UI and Tailwind CSS v4. While the package manifest correctly marks `motion` and other specialized libraries under `peerDependenciesMeta` with `optional: true`, `packages/ui/README.md` previously instructed all consumers to run `pnpm add @theo/ui motion`. 

Furthermore, our codebase analysis confirms that:
1. Root exports (`src/index.ts`) export only core primitives (`Button`, `Dialog`, `Select`, `Tabs`, etc.), utilities, and providers. None of the root exports depend on `motion`.
2. `motion` is only consumed inside 6 specific components/patterns: `auto-height.tsx`, `cart-button.tsx`, `hold-button.tsx`, `undo-button.tsx`, `halo-search.tsx`, and `tip-selector.tsx`.
3. Other specialized packages (`recharts`, `shiki`, `better-auth`, `@tanstack/react-table`, `qrcode`) are likewise isolated in dedicated subpaths.

## Goals / Non-Goals

**Goals:**
- Provide a clean, zero-friction default installation experience (`pnpm add @theo/ui`) without mandatory animation bloat.
- Provide clear, grouped installation recipes for each optional capability (Motion, Auth, Charts, Tables, Syntax Highlighting, QR Codes).
- Maintain 100% backward compatibility with consumers who already use `motion` or specialized patterns.
- Ensure automated verification via `publint` and `tsc` that optional peers remain decoupled from core exports.

**Non-Goals:**
- Re-architecting internal component logic or swapping out Base UI or Motion.
- Creating a separate CLI tool (e.g. `npx theo add`) in this change (deferred to future roadmap).

## Decisions

### Decision 1: Three-Tier Dependency Structure

We structure dependencies across three clean tiers:
1. **Direct `dependencies`**: Libraries bundled/imported by the core library that are invisible to the consumer's package manifest (e.g. `@base-ui/react`, `clsx`, `tailwind-merge`, `cva`, `lucide-react`).
2. **Required `peerDependencies`**: Host environment packages that MUST be shared singletons across the entire React application (`react: ">=19.0.0"`, `react-dom: ">=19.0.0"`).
3. **Optional `peerDependencies` + `peerDependenciesMeta`**: Domain-specific libraries (`motion`, `recharts`, `shiki`, `@tanstack/react-table`, `better-auth`, `qrcode`) marked with `optional: true`. Package managers will never fail or warn on installation if these are omitted.

*Alternative Considered*: Bundling `motion` directly in `dependencies`. Rejected because it creates duplicate bundle weight (~30-60KB gzipped) and breaks React Context between host animations and library components.

### Decision 2: Decoupled Onboarding Documentation

We refactor the installation documentation in `packages/ui/README.md`:
- **Step 1 (Core)**: Primary install commands strictly install `@theo/ui` (supporting pnpm, npm, yarn, bun).
- **Step 2 (Feature Recipes)**: Clearly demarcated tables and code snippets showing exact commands for each optional feature (e.g., `pnpm add motion` for micro-interactions, `pnpm add recharts` for charts).
- **Step 3 (Theme & CSS)**: Explains the `@import "@theo/ui/styles.css";` integration with Tailwind CSS v4.

### Decision 3: Subpath Isolation Guardrails

We ensure that all components requiring optional peer dependencies remain isolated behind dedicated subpath exports (`@theo/ui/patterns/*` or specific component paths like `@theo/ui/components/auto-height` and `@theo/ui/components/chart`). Root export `packages/ui/src/index.ts` must never import optional peer-dependent modules.

## Risks / Trade-offs

- **Risk**: A consumer imports `CartButton` without reading the pattern documentation and encounters `Cannot find module 'motion/react'`.
- **Mitigation**: Document optional peers clearly in both the main `README.md` and in component-level JSDoc comments so developers immediately know which package to add if they opt into that pattern.
