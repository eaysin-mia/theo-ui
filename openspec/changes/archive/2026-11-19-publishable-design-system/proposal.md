# Proposal

## Why

The current `@workspace/ui` package contains a large set of components copied from coss ui and other registries, but its packaging, export structure, and build architecture are not yet configured for reliable, clean distribution as an internal publishable package. Furthermore, domain-specific integrations—most notably Better Auth UI and complex widgets (Gantt, Charts, Tree)—impose heavy dependencies that would bloat lightweight consumers if bundled together. Additionally, maintaining duplicate stylesheets (`globals.css` and `theme.css`) and using custom build scripts (`scripts/build.mjs`) adds maintenance fragility. Addressing this now establishes an ESM-first compilation pipeline using pure `tsc`, eliminates manual build scripts, removes duplicate legacy stylesheets, isolates CLI-managed upstream code from custom extensions, modularizes domain features with optional peer dependencies, and provides a streamlined token and publishing workflow for consumers.

## What Changes

- **BREAKING**: Transition package imports from tsconfig path aliases (`@workspace/ui/*`) to standard Node subpath imports (`#components/*`, `#patterns/*`, `#lib/*`, `#hooks/*`) targeting compiled `dist/` output.
- **BREAKING**: Re-architect CSS distribution by shipping an authoritative `globals.css` directly as source (`./src/styles/globals.css`), consolidating all design tokens and theme variables, and providing backwards-compatible `./theme.css` aliasing.
- Standardize on plain `tsc -p tsconfig.build.json` multi-file ESM compilation with declaration maps, completely deleting `scripts/build.mjs` and eliminating `tsc-alias`.
- Establish a strict folder separation between upstream CLI-vendored coss components (`src/components/`), domain feature registries (`src/components/auth/`, `src/lib/auth/`), and internally authored components/recipes (`src/patterns/`), ensuring safe CLI overwrites and clean upstream `--diff` tracking.
- Modularize domain-specific features (Better Auth UI, Gantt, Recharts, TanStack Table) into dedicated subpath exports (`./components/auth`, `./lib/auth`, `./patterns/*`) backed by optional peer dependencies, keeping the core primitive installation lightweight.
- Eliminate monolithic barrel exports in favor of granular, per-component exports and re-exports of Base UI primitives (`./base-ui/*`).
- Add Changesets configuration and automated CI/CD workflows for versioning and publishing private scoped releases.
- Establish validation gates including `publint` and `@arethetypeswrong/cli` to verify package export and typing correctness.

## Capabilities

### New Capabilities
- `component-library-packaging`: Packaging, pure `tsc` build pipeline, subpath imports, per-component exports, Base UI primitive re-exports, and architectural isolation between upstream vendored primitives and internally authored patterns.
- `domain-feature-modularization`: Dedicated subpath packaging, exclusion from the root barrel entry point, and optional peer dependency contracts for heavy domain modules (Better Auth UI, Gantt, Charts).
- `design-tokens-and-styling`: Standalone `globals.css` source distribution, CSS variable mapping, dark mode variant mechanics, and Tailwind CSS v4 consumer registration contracts.

### Modified Capabilities
<!-- None: Greenfield spec baseline for this repository. -->

## Impact

- `packages/ui`: Consolidation into single authoritative `src/styles/globals.css`, removal of `scripts/build.mjs` in favor of `"build": "tsc -p tsconfig.build.json"`, directory reorganization (`src/patterns/`), `package.json` exports/imports (`./globals.css: ./src/styles/globals.css`, `./theme.css`), dependency reclassification (moving heavy domain packages to optional peer dependencies), removal of `tsc-alias`.
- `apps/web`: Updated CSS imports (importing `@workspace/ui/globals.css` with encapsulated `@source`), layout alignment with Base UI portal requirements (`isolate` stacking context), and font variable bindings.
- Tooling and CI: Changesets setup (`.changeset/config.json`), Biome or unified linting verification, GitHub Actions (`ci.yml`, `release.yml`).
