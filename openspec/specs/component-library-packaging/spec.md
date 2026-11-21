# component-library-packaging Specification

## Purpose
Defines the packaging, subpath imports, export targets, and multi-file ESM compilation contracts for the design system components and Base UI re-exports.

## Requirements

### Requirement: Granular Subpath Package Exports

The package SHALL provide explicit, granular export entries for individual components, patterns, hooks, utilities, and Base UI primitives, mapping each to its respective compiled JavaScript module and TypeScript declaration file.

#### Scenario: Consumer imports individual component

- **GIVEN** a consumer application with standard ESM resolution
- **WHEN** the consumer imports `@workspace/ui/components/button`
- **THEN** Node and bundlers resolve the import to `./dist/components/button.js` with types from `./dist/components/button.d.ts` without loading unrelated components

#### Scenario: Consumer imports Base UI primitive re-export

- **GIVEN** an application consuming the UI package
- **WHEN** the consumer imports `@workspace/ui/base-ui/use-render`
- **THEN** the import resolves directly to the library's re-exported Base UI primitive module and type definition without requiring a direct consumer dependency on `@base-ui/react`

### Requirement: Standard Internal Subpath Resolution

The package SHALL use `package.json#imports` entries (`#components/*`, `#patterns/*`, `#hooks/*`, `#lib/*`) targeting compiled `./dist/*` files with explicit `.js` extensions for internal cross-references.

#### Scenario: Cross-component import in compiled output

- **GIVEN** a pattern component referencing an internal utility or primitive
- **WHEN** the file imports `#lib/utils` or `#components/button`
- **THEN** Node and external bundlers resolve the reference to `./dist/lib/utils.js` or `./dist/components/button.js` natively without tsconfig path re-writing

### Requirement: Component Source Organization and Upstream Isolation

The package SHALL isolate CLI-vendored coss registry files in `src/components/` from bespoke or composed components in `src/patterns/`.

#### Scenario: Upstream registry update diffing

- **GIVEN** an existing vendored component in `src/components/`
- **WHEN** a developer executes `shadcn add @coss/<name> --diff` or `--overwrite`
- **THEN** the diff applies strictly against `src/components/` without impacting custom implementations located in `src/patterns/`

### Requirement: Preservation of Client Directives in Compiled ESM

The build pipeline SHALL emit unbundled, individual ESM JavaScript files corresponding to each source module, preserving `"use client"` directives at the top of client component files.

#### Scenario: Next.js Server Component importing client component

- **GIVEN** a Next.js App Router application consuming the package
- **WHEN** a Server Component imports a component with client-side interactive hooks from `@workspace/ui/components/dialog`
- **THEN** Next.js identifies the `"use client"` directive in the emitted JS and treats it as a client component boundary without compilation errors

### Requirement: Private Registry Publishing Configuration

The package manifest SHALL configure `publishConfig` targeting the public npm registry (`https://registry.npmjs.org`) with `"access": "public"` and explicitly enumerated publishable files (`dist`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`).

#### Scenario: Running package publishing check
- **WHEN** a release workflow packages the library
- **THEN** only `dist/`, `README.md`, `LICENSE`, and `THIRD_PARTY_LICENSES.md` are packaged, and publishing targets public access on npm without restriction

### Requirement: Unbundled Multi-File ESM Output Contract

The build pipeline SHALL emit a 1-to-1 unbundled ESM file structure from `src/` to `dist/`, maintaining separate modules and preserving `"use client"` directives at the top of client files to ensure zero-bundle-overhead tree shaking.

#### Scenario: Subpath import tree shaking
- **WHEN** a consumer imports `@theo/ui/components/button`
- **THEN** the consumer bundler loads only `dist/components/button.js` and its direct dependencies without evaluating unrelated components

### Requirement: Tiered Peer Dependency Architecture

The package SHALL explicitly separate host runtime dependencies into required peer dependencies (`react`, `react-dom`) and optional feature peer dependencies (`motion`, `recharts`, `shiki`, `@tanstack/react-table`, `better-auth`, `@better-auth-ui/core`, `@better-auth-ui/react`, `qrcode`) configured with `optional: true` in `peerDependenciesMeta`.

#### Scenario: Installing core package without optional peers
- **WHEN** a consumer installs `@theo/ui` in a project with React 19 without installing `motion` or other optional peers
- **THEN** modern package managers (pnpm, npm, yarn, bun) install cleanly without peer dependency mismatch warnings or errors

#### Scenario: Using core UI primitives without motion
- **WHEN** a consumer imports core components (`Button`, `Dialog`, `Select`, `Input`, `Tabs`) from `@theo/ui`
- **THEN** the components execute without requiring `motion` or throwing missing module errors

### Requirement: Granular Installation Guidance

The package documentation and distribution materials SHALL present the lean core package as the default installation command across all supported package managers (pnpm, npm, yarn, bun), with optional peer dependencies documented under categorized, on-demand feature sections.

#### Scenario: Consumer onboarding via primary documentation
- **WHEN** a developer views the primary installation section in `README.md`
- **THEN** the primary install command prescribes only `@theo/ui`, and optional peer dependencies (`motion`, `recharts`, `shiki`, `better-auth`, `@tanstack/react-table`, `qrcode`) are explicitly documented with their respective feature recipes

### Requirement: Strict Type Declaration Emission and Compiler Policy

The build pipeline SHALL emit TypeScript declaration files (`.d.ts` and `.d.ts.map`) generated under strict compiler rules (`strict: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`), ensuring zero ambient type leakage and full compatibility with consumer projects configured for either NodeNext or bundler module resolution.

#### Scenario: Consumer project compiling with strict NodeNext
- **WHEN** an external project with `"moduleResolution": "NodeNext"` imports `@theo/ui` subpaths
- **THEN** TypeScript resolves the corresponding `.d.ts` declaration maps with zero compiler warnings or resolution errors

### Requirement: Automated Pre-Publish Hygiene Verification

The repository verification pipeline SHALL run automated packaging linting (`publint`) and type resolution checking (`@arethetypeswrong/cli`) before any package publish event to ensure all subpath exports resolve correctly across both NodeNext and Bundler environments.

#### Scenario: Verifying package subpath integrity
- **WHEN** the CI pipeline executes `package:check`
- **THEN** publint validates that every entry in `package.json#exports` corresponds to an existing, valid `.js` file and `.d.ts` declaration
