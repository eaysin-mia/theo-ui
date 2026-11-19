# Design: Standalone Theo UI Library Architecture in Turborepo

## Context

The repository is structured as a pnpm Turborepo monorepo. We are designing `@theo/ui` as a completely standalone, self-contained enterprise-grade UI library built on Base UI primitives and styled with Tailwind CSS v4, paired with an interactive Next.js playground (`apps/web`).

**Key Architectural Principle**: `@theo/ui` has **zero external runtime dependency on coss**. Coss UI was utilized strictly as an internal starting base / reference implementation for scaffolding initial primitives and design tokens in-tree. Downstream applications consume only `@theo/ui`. All custom additions, composite patterns, and future components build directly on `@theo/ui`'s internal Base UI primitive layer and Tailwind CSS v4 design tokens.

See [proposal.md](file:///home/eaysin/workspace/ui/openspec/changes/coss-turborepo-ui-library-architecture/proposal.md) for motivation and [specs/](file:///home/eaysin/workspace/ui/openspec/changes/coss-turborepo-ui-library-architecture/specs/) for requirement contracts.

## Executive Summary & Core Dilemmas Resolved

| Dilemma | The Common Trap | `@theo/ui` Standard Decision |
| :--- | :--- | :--- |
| **Compilation Strategy** | Monolithic bundling (`tsup` / `rollup`) into a single bundle. | **Unbundled multi-file ESM (`tsc`)**. 1-to-1 file output preserving `"use client"` directives and enabling 100% fine-grained tree-shaking. |
| **Tailwind CSS v4 Distribution** | Forcing consumers to configure complex `@source` paths into `node_modules`. | **Dual Distribution Model**: Pre-compiled `dist/styles.css` for zero-config consumers + exported `@theme inline` CSS variables for deep theming. |
| **Heavy Domain Dependencies** | Putting charts, auth, tables, and code highlighters in the root barrel export. | **Strict Root-Exclusion & Subpaths**: Heavy integrations (`recharts`, `shiki`, `better-auth`) are isolated in dedicated subpaths with `optional: true` peer dependencies. |
| **Monorepo DX & Live Sync** | Testing raw TypeScript source instead of compiled artifacts. | **Artifact-first live development**: `packages/ui` runs `tsc --watch` during `pnpm dev`, ensuring `apps/web` tests the exact compiled `dist/` that gets published. |

## Goals / Non-Goals

**Goals:**
- Provide a 100% self-contained, standalone component library published as `@theo/ui`.
- Zero external runtime coupling or package dependencies on coss for downstream applications (`pnpm add @theo/ui` is all consumers need).
- Deliver optimal tree-shaking and bundler performance through unbundled multi-file ESM compilation and explicit subpath exports (`./components/*`, `./patterns/*`, `./base-ui/*`).
- Ensure full compatibility with Next.js App Router (Server & Client Components) by preserving `"use client"` directives at the individual module level.
- Distribute pre-compiled Tailwind CSS v4 stylesheets (`dist/styles.css`) for zero-config consumer integration.
- Standardize on Base UI `render` prop element composition, avoiding legacy `asChild` patterns.
- Configure Turborepo task pipelines for caching, parallel execution, and live local development.

**Non-Goals:**
- Requiring consumers to install `@coss/ui` or configure any external `@coss` registry.
- Supporting legacy React 18 or Tailwind CSS v3 (strictly targeting React 19+ and Tailwind CSS v4).
- Bundling all components into a single monolithic bundle with Rollup or Webpack (the library deliberately uses unbundled TypeScript compilation).

## Architecture & Monorepo Structure

### Monorepo Structure
```
ui/
├── apps/
│   └── web/                               # Next.js 15/16 playground & showcase
│       ├── app/                           # App Router pages and demo routes
│       ├── components/                    # App-specific UI, providers, shells
│       ├── package.json                   # Consumes "@theo/ui": "workspace:*"
│       └── tsconfig.json
├── packages/
│   ├── ui/                                # Publishable UI library (@theo/ui)
│   │   ├── src/
│   │   │   ├── base-ui/                   # Re-exports of @base-ui/react primitives
│   │   │   ├── components/                # Core base UI components (button, dialog, etc.)
│   │   │   ├── patterns/                  # Custom composite widgets & team patterns
│   │   │   ├── hooks/                     # Custom React hooks (useMediaQuery, etc.)
│   │   │   ├── lib/                       # Utilities (cn, formatters)
│   │   │   ├── styles/                    # globals.css (Tailwind v4 tokens & theme)
│   │   │   └── index.ts                   # Root barrel export (core primitives only)
│   │   ├── dist/                          # Compiled unbundled ESM, types, and CSS
│   │   ├── package.json                   # Exports maps, imports, and publishConfig
│   │   ├── tsconfig.json                  # Editor configuration
│   │   ├── tsconfig.build.json            # Compilation config emitting to dist/
│   │   └── COSS_SYNC.md                   # Internal historical reference notes
│   ├── eslint-config/                     # Shared ESLint rules (@workspace/eslint-config)
│   └── typescript-config/                 # Shared tsconfigs (@workspace/typescript-config)
├── turbo.json                             # Turborepo task orchestration
├── pnpm-workspace.yaml                    # Workspace package declarations
└── package.json                           # Root scripts and dev dependencies
```

## Decisions & Rationale

### Decision 1: Self-Contained Library Identity (`@theo/ui`)
- **Choice**: The library is packaged, branded, and consumed exclusively as `@theo/ui`.
- **Rationale**: Coss UI served only as an internal scaffolding accelerator. Consumers should never have to know about, install, or resolve `@coss/*` packages. All components, styling tokens, and exports belong to `@theo/ui`.
- **Component Organization**:
  - `src/components/`: Core foundational primitives (button, dialog, input, select, etc.).
  - `src/patterns/`: Higher-level composites and domain-specific widgets (Gantt, Calendar, Tree, Kanban, etc.) built by composing `@theo/ui` primitives.
  - `src/base-ui/`: Direct access to underlying `@base-ui/react` primitives.

### Decision 2: Unbundled ESM Compilation (`tsc`) over Bundlers
- **Choice**: Emit separate, unbundled ESM files directly using `tsc -p tsconfig.build.json` targeting `./dist/`.
- **Rationale**:
  1. Preserves individual file boundaries and `"use client"` directives at the top of client component files.
  2. Guarantees 100% fine-grained tree-shaking when consumers import via subpaths (`@theo/ui/components/button`).
  3. Eliminates duplicate code and chunking anomalies created by bundlers.
  4. Keeps build times near-instant with incremental caching.

### Decision 3: Subpath Exports & Internal Package Imports
- **Choice**: Granular `package.json#exports` paired with `package.json#imports`:
  ```json
  "imports": {
    "#components/*": "./dist/components/*.js",
    "#patterns/*": "./dist/patterns/*.js",
    "#hooks/*": "./dist/hooks/*.js",
    "#lib/*": "./dist/lib/*.js",
    "#base-ui/*": "./dist/base-ui/*.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "import": "./dist/components/*.js"
    },
    "./patterns/*": {
      "types": "./dist/patterns/*.d.ts",
      "import": "./dist/patterns/*.js"
    },
    "./base-ui/*": {
      "types": "./dist/base-ui/*.d.ts",
      "import": "./dist/base-ui/*.js"
    }
  }
  ```
- **Rationale**: Internal cross-references resolve natively at runtime in Node.js and bundlers without requiring tsconfig path rewriting, and external consumers can import precisely what they need.
- **Root Exclusion**: Domain-specific or heavy modules (e.g. Better Auth UI, Gantt, Calendar, Recharts) are excluded from the root `.` barrel and exported strictly through dedicated subpaths (`@theo/ui/components/auth`, `@theo/ui/patterns/gantt`).

### Decision 4: Base UI `render` Prop Composition
- **Choice**: Standardize element composition on Base UI's `render` prop (`<Button render={<Link href="/" />}>`), strictly avoiding Radix's deprecated `asChild` / `Slot` pattern.
- **Rationale**: Base UI handles prop merging, ref forwarding, and accessibility attributes cleanly through `render`.

### Decision 5: Pre-Compiled Tailwind CSS v4 Stylesheet (Dual Distribution)
- **Choice**: Compile `src/styles/globals.css` into `dist/styles.css` using `@tailwindcss/cli` during `pnpm build`.
- **Rationale**: Allows consumer applications (Next.js, Vite, Remix) to include all design tokens, animations, and component styles with a single `@import "@theo/ui/styles.css";` without needing complex `@source` directives targeting package `node_modules`. Consumers customize tokens via CSS variables.

### Decision 6: Artifact-First Live Development in Turborepo
- **Choice**: `apps/web` consumes `"@theo/ui": "workspace:*"`, resolving directly against `packages/ui/dist/`. During `pnpm dev`, `packages/ui` runs `tsc --watch` concurrently with `next dev`.
- **Rationale**: Ensures the playground exercises the exact compiled artifacts that will be published to the private npm registry, preventing publishing regressions.

## Risks / Trade-offs

- **[Risk]** Missing `"use client"` in unbundled files could cause Next.js SSR build errors.
  → **Mitigation**: Automated checks and lint rules ensuring every interactive component with hooks declares `"use client"` as the first line of the source file.
- **[Risk]** Large bundle sizes if consumers import from root `.` barrel.
  → **Mitigation**: Enforce granular subpath imports in documentation and exclude heavy composite patterns and auth flows from the root index file.
