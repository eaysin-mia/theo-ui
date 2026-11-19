# design-tokens-and-styling Specification

## Purpose
Defines the theme CSS token architecture, CSS variable mappings, dark mode variant handling, and Tailwind CSS v4 consumer registration rules.

## Requirements

### Requirement: Pre-Compiled Stylesheet Distribution
The package SHALL compile all design tokens, theme variables, and component utility classes into a standalone, minified production stylesheet (`dist/styles.css`) using the Tailwind CSS v4 CLI during the package build step. The package SHALL export this stylesheet via `package.json#exports` as `"./styles.css"` (with backwards-compatible aliases for `"./globals.css"` and `"./theme.css"`).

#### Scenario: Consumer zero-config styling inclusion
- **GIVEN** a consumer application (Next.js, Vite React, Remix)
- **WHEN** the consumer imports `@workspace/ui/styles.css` in their root stylesheet
- **THEN** all component styles, tokens, and animations are immediately available with zero configuration, without requiring `@source` directives or `node_modules` path declarations

### Requirement: Class-Based Dark Mode Variant Support
The package styling contract SHALL support class-based dark mode switching via `.dark` class targeting CSS variable values.

#### Scenario: Theme switching at runtime
- **GIVEN** an application HTML element with class `dark`
- **WHEN** components render inside the dark container
- **THEN** semantic tokens (`--background`, `--foreground`, `--primary`, `--card`) switch to their dark mode color values

### Requirement: Font Variable and Stacking Context Contracts
The package specification SHALL define the required CSS variable bindings for typography (`--font-sans`, `--font-mono`, `--font-heading`) and portal stacking context (`isolate`).

#### Scenario: Portal composition on modern viewports
- **GIVEN** an application layout utilizing Base UI overlay primitives such as Dialog, Menu, or Popover
- **WHEN** rendered within a container styled with `isolate relative min-h-svh flex-col`
- **THEN** overlay portals mount and stack correctly across desktop and mobile viewports without z-index clipping

### Requirement: Semantic Theme Token Inline Mapping

The package stylesheet SHALL define design system tokens inside Tailwind CSS v4 `@theme inline` blocks, mapping semantic variables for colors, typography, borders, and animations to CSS variables.

#### Scenario: Custom pattern consuming theme tokens
- **WHEN** a custom composite component is authored in `src/patterns/`
- **THEN** it utilizes semantic Tailwind utility classes (such as `bg-background`, `text-primary-foreground`, `rounded-md`) that automatically respond to theme variable overrides and dark mode classes

### Requirement: Dual Distribution Styling Support

The package SHALL distribute both a pre-compiled, minified production stylesheet (`dist/styles.css`) for zero-config inclusion and exposed CSS variables for runtime theming.

#### Scenario: Consumer zero-config styling
- **WHEN** a consumer application imports `@import "@theo/ui/styles.css";`
- **THEN** all component styles, tokens, and animations are immediately available without requiring local Tailwind configuration
