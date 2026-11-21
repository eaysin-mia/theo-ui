# Design: shadcn-Compatible Registry and CLI Distribution

## Context

`theoui` currently exists as a standalone npm package (`theoui` v0.3.0) and monorepo workspace package consumed by `apps/web`. The components rely on `@base-ui/react`, Tailwind CSS v4 (`@theme inline`), and modular subpaths.

While traditional enterprise setups benefit from the compiled npm package, open-source developers increasingly demand copy-paste component installation via CLI (popularized by shadcn/ui and followed by coss UI, Magic UI, Better Auth UI, and Kokonut UI). This design provides a clean registry generation pipeline without compromising the existing npm package architecture.

See `proposal.md` for motivation and `specs/` for behavioral requirements.

## Goals / Non-Goals

**Goals:**
- Provide a robust registry generation script (`packages/ui/scripts/build-registry.ts`) that compiles individual `r/{name}.json` items and a master `registry.json` index.
- Ensure 100% compliance with `https://ui.shadcn.com/schema/registry-item.json` specifications.
- Automatically extract runtime npm `dependencies` and cross-component `registryDependencies` by analyzing source code imports.
- Host the compiled registry files in `apps/web/public/r/` so consumers can install components via `npx shadcn@latest add <url>` or `@theoui` registry namespaces.
- Retain existing npm compilation and Changeset publishing flows in `packages/ui`.

**Non-Goals:**
- Creating a proprietary, custom CLI tool when the industry-standard `shadcn` CLI already supports external registry URLs and namespaces natively.
- Migrating Base UI primitives to Radix UI or changing existing UI styling conventions.

## Decisions

### Decision 1: Standard shadcn Registry Schema v1 & v2 Compliance
- **Choice**: Structure each payload according to `https://ui.shadcn.com/schema/registry-item.json`:
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema/registry-item.json",
    "name": "button",
    "type": "registry:ui",
    "title": "Button",
    "description": "An accessible, styled interactive button built on Base UI.",
    "dependencies": ["@base-ui/react", "class-variance-authority"],
    "registryDependencies": [],
    "files": [
      {
        "path": "ui/button.tsx",
        "type": "registry:ui",
        "content": "..."
      }
    ]
  }
  ```
- **Rationale**: Any developer with `npx shadcn@latest` can immediately consume components without installing new tooling.

### Decision 2: Automated AST Import Parsing
- **Choice**: Implement an AST-based parser in `packages/ui/scripts/build-registry.ts` (using TypeScript compiler API) that walks component source files to:
  1. Detect third-party npm packages (`@base-ui/react`, `lucide-react`, `motion`, `date-fns`, etc.) and add them to `dependencies`.
  2. Detect intra-library imports (`#components/button` or relative `../button`) and map them to `registryDependencies: ["button"]`.
  3. Transform monorepo internal aliases (`#lib/utils`, `#components/*`) into standard shadcn configurable aliases (`@/lib/utils`, `@/components/ui/*`).
- **Alternative Considered**: Manually maintaining registry manifests. Rejected because manual lists quickly drift from actual component source dependencies.

### Decision 3: Static File Hosting via `apps/web/public/r/`
- **Choice**: Output compiled registry JSON files to `apps/web/public/r/` as part of Turborepo's `build` pipeline.
- **Rationale**: Next.js automatically serves static files from `public/`, providing zero-latency, edge-cached registry distribution in production and instant local testing during development (`http://localhost:3000/r/button.json`).

### Decision 4: Registry Item Categorization
- `registry:ui`: Base primitives (button, dialog, select, input, tabs, drawer, etc.).
- `registry:block`: Composite multi-file patterns (gantt, event-calendar, kanban, app-layout, auth forms).
- `registry:hook`: Reusable hooks (use-debounce, use-auto-height, use-media-query).
- `registry:lib`: Shared utilities (utils, syntax highlighter, composer helpers).
- `registry:style`: The core Tailwind CSS v4 theme definitions and OKLCH color tokens (`@theoui/style`).

## Risks / Trade-offs

- **[Risk] Consumer alias divergence** (`@/components/ui` vs `src/components/ui` vs `#components`):
  → *Mitigation*: The shadcn CLI reads the target project's `components.json` and automatically rewrites import aliases during installation based on the consumer's configuration.
- **[Risk] Base UI version drift between consumer and library**:
  → *Mitigation*: Each component manifest explicitly specifies compatible semver ranges in `dependencies` (`@base-ui/react: "^1.9.0"`).
- **[Risk] Monorepo build overhead**:
  → *Mitigation*: The registry builder script runs in seconds using fast in-memory compilation and is cached by Turborepo under `turbo.json`.
