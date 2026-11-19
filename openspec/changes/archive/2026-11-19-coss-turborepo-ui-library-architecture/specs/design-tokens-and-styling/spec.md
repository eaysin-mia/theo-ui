# Spec Delta

## ADDED Requirements

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
