# Spec Delta: component-library-packaging

## ADDED Requirements

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
