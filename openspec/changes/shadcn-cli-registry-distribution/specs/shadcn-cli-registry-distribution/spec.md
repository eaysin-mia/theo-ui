# Spec Delta: shadcn-cli-registry-distribution

## Purpose

Defines the shadcn-compatible registry compilation pipeline, JSON schema compliance, automated dependency resolution, inter-component registry dependency graphs, and CLI installation contracts.

## ADDED Requirements

### Requirement: Automated Registry Item Compilation

The build pipeline SHALL compile every UI component, pattern, hook, and utility in the design system into an individual JSON registry item adhering to the official shadcn registry schema (`https://ui.shadcn.com/schema/registry-item.json`).

#### Scenario: Compiling a standalone UI primitive
- **WHEN** the registry builder processes a base component like `button.tsx`
- **THEN** it emits a JSON file (`r/button.json`) containing `name`, `type: "registry:ui"`, source file contents with transformed relative aliases, and required npm dependencies

#### Scenario: Compiling a composite pattern or block
- **WHEN** the registry builder processes a composite pattern like `gantt` or `event-calendar`
- **THEN** it emits a registry item categorized as `type: "registry:block"` or `type: "registry:component"` containing all associated submodule files and type definitions

### Requirement: Transitive Dependency and Peer Package Resolution

The registry generator SHALL analyze AST import declarations in each component source file to declare required npm runtime `dependencies` and `devDependencies` in each item's manifest without exposing monorepo-internal workspace aliases.

#### Scenario: Component with external third-party library
- **WHEN** a component imports from `@base-ui/react`, `lucide-react`, `date-fns`, or `motion`
- **THEN** the generated registry JSON lists those packages in its `dependencies` array with appropriate semver ranges

#### Scenario: Component with optional peer dependency
- **WHEN** an advanced component imports from `@tanstack/react-table`, `recharts`, or `shiki`
- **THEN** the registry manifest includes those dependencies in its `dependencies` array so the CLI installs them into the consumer app

### Requirement: Inter-Component Registry Dependency Linking

The registry compiler SHALL identify intra-library component references and declare them as `registryDependencies` rather than duplicating component code within the item manifest.

#### Scenario: Composite component referencing primitives
- **WHEN** `alert-dialog` references `button` or `dialog`
- **THEN** the generated `r/alert-dialog.json` lists `button` and `dialog` in its `registryDependencies` array, prompting the CLI to install them concurrently

#### Scenario: Multi-layered pattern dependency chain
- **WHEN** `event-calendar` depends on `calendar`, `popover`, `select`, and `button`
- **THEN** all prerequisite primitives are declared in `registryDependencies` and resolved transitively by the shadcn CLI

### Requirement: Remote Registry Endpoints and Index Manifest

The build pipeline SHALL emit a unified `registry.json` index and per-item `r/{name}.json` static payloads to `apps/web/public/r/` for distribution via HTTP and compatibility with the shadcn CLI registry protocol.

#### Scenario: Fetching registry index
- **WHEN** a client requests `/r/index.json` or `registry.json`
- **THEN** the server returns an array of all available registry items with names, types, descriptions, and file pointers

#### Scenario: Fetching single component payload via shadcn CLI
- **WHEN** a developer executes `pnpm dlx shadcn@latest add @theoui/dialog` or `shadcn add http://<host>/r/dialog.json`
- **THEN** the CLI receives the valid JSON schema payload and writes the component files into the consumer's configured `components.json` directory
