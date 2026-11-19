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
