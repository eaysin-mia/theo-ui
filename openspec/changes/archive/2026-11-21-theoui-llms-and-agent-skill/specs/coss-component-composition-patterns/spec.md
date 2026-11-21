# Spec Delta

## MODIFIED Requirements

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
