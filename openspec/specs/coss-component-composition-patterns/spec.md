# coss-component-composition-patterns Specification

## Purpose
Defines the component architecture, Base UI primitive integration, `@theo/ui` styling token adherence, trigger/popup composition rules, and `render` prop element delegation for base and custom components.

## Requirements

### Requirement: Base UI Primitive Re-exporting and Isolation

The library SHALL provide direct access to unstyled `@base-ui/react` primitives and hooks through a dedicated `src/base-ui/` module and `./base-ui` subpath export, keeping consumer dependencies zero-config.

#### Scenario: Consumer accessing raw Base UI primitive
- **WHEN** an application imports a primitive or hook from `@theo/ui/base-ui`
- **THEN** the consumer receives the unstyled Base UI element without requiring a direct `@base-ui/react` dependency in the consumer application

### Requirement: Standalone Self-Contained Component Ownership

The package SHALL operate as an independent, standalone library (`theoui`) with zero external runtime dependencies on upstream registries, hosting all base and composite components in-tree.

#### Scenario: Consumer installing the UI library
- **WHEN** an application runs `pnpm add theoui`
- **THEN** the package installs without requiring any `@coss/*` packages or external registry configuration

### Requirement: Element Composition via Render Prop

Components wrapping interactive elements SHALL use Base UI's `render` prop for polymorphic element substitution instead of deprecated `asChild` patterns.

#### Scenario: Rendering button as Next.js Link
- **WHEN** a consumer passes `<Button render={<Link href="/dashboard" />}>`
- **THEN** the component merges attributes and renders an accessible anchor tag with button styling and behavior

### Requirement: Trigger and Popup Structural Hierarchy

Overlay and popover components (Dialog, Menu, Select, Popover, Tooltip, Drawer) SHALL follow strict hierarchical trigger/content patterns and enforce Drawer over Sheet for side panels.

#### Scenario: Edge panel composition
- **WHEN** a responsive slide-out panel is constructed
- **THEN** the Drawer component is utilized for desktop and mobile edge sheets with standard portal mounting
