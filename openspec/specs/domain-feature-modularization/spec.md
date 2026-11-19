# domain-feature-modularization Specification

## Purpose
Defines the isolated subpath packaging, optional peer dependency declarations, and root-exclusion rules for domain-specific feature modules including Better Auth UI and complex composite widgets.

## Requirements

### Requirement: Dedicated Domain Subpath Exports

The package SHALL provide distinct, isolated subpath export entries for domain feature modules including `./components/auth`, `./lib/auth`, and complex composite components, mapping each to its respective compiled JavaScript and declaration files.

#### Scenario: Consumer imports authentication components

- **GIVEN** a consumer application implementing authentication flows
- **WHEN** the consumer imports `@workspace/ui/components/auth` or `@workspace/ui/lib/auth`
- **THEN** bundlers resolve the modules directly from `./dist/components/auth/` and `./dist/lib/auth/` without loading unrelated core primitives

### Requirement: Optional Peer Dependencies for Domain Modules

The package manifest SHALL declare third-party domain dependencies (such as Better Auth, Better Auth UI, Recharts, and TanStack Table) as optional peer dependencies under `peerDependenciesMeta`.

#### Scenario: Consumer installs package for core primitives only

- **GIVEN** a consumer application that utilizes only core UI primitives such as Button and Dialog
- **WHEN** the package manager installs `@workspace/ui`
- **THEN** the consumer application is not required to install Better Auth, Recharts, or TanStack Table packages

### Requirement: Domain Exclusion from Root Entry Point

The package root entry point (`.`) SHALL NOT re-export domain-specific modules, heavy integration components, or Better Auth plugins.

#### Scenario: Consumer imports from root entry point

- **GIVEN** an application importing standard components from `@workspace/ui`
- **WHEN** the bundle analysis or runtime evaluation executes
- **THEN** no Better Auth, charting, or complex widget code is pulled into the application bundle
