# Proposal

## Why

Consumers installing `@theo/ui` are currently instructed by documentation to execute `pnpm add @theo/ui motion`, creating confusion regarding whether `motion` is mandatory, polluting host dependencies, and inflating bundle sizes for users who only need static primitives. Standardizing our dependency architecture based on open-source ecosystem best practices (e.g., Radix, Base UI, HeroUI, Mantine) will clearly decouple core primitives from heavy optional peers, providing a lean core installation and explicit on-demand installation recipes for specialized features.

## What Changes

- Clarify and document the primary installation command as lean and peer-minimal (`pnpm add @theo/ui`, `npm i @theo/ui`, `yarn add @theo/ui`, `bun add @theo/ui`), removing mandatory `motion` coupling from the default onboarding flow.
- Formally classify package dependencies into three distinct tiers:
  1. **Core dependencies (`dependencies`)**: Essential utilities bundled/resolved directly by the package (Base UI, clsx, tailwind-merge, cva).
  2. **Required peer dependencies (`peerDependencies`)**: Host runtime engines strictly required for all usage (`react`, `react-dom` `>=19.0.0`).
  3. **Optional feature peer dependencies (`peerDependenciesMeta` with `optional: true`)**: Specialized engines (`motion`, `recharts`, `shiki`, `@tanstack/react-table`, `better-auth`, `qrcode`) required only when consuming specific subpath exports.
- Update `packages/ui/README.md` and documentation to provide copy-pasteable installation blocks categorized by use case (Core, Motion & Animations, Auth, Charts, Data Tables, Code Highlighting).
- Audit all root exports in `packages/ui/src/index.ts` to ensure no optional peer dependencies are transitively imported in the main bundle.

## Capabilities

### New Capabilities
<!-- No new standalone capabilities; modifications extend component-library-packaging -->

### Modified Capabilities
- `component-library-packaging`: Adds requirements for peer dependency tiering, optional peer decoupling, and standardized consumer installation and error guidance.

## Impact

- **Documentation**: Updates `packages/ui/README.md` installation guides across pnpm, npm, yarn, and bun.
- **Package Manifest**: Audits and verifies `packages/ui/package.json` `peerDependencies` and `peerDependenciesMeta` flags.
- **Architecture**: Enforces zero-bundle-overhead and ensures root entry points remain free of optional peer dependencies.
- **Breaking Changes**: None. Backwards compatible with existing consumers who already have `motion` installed.
