# Spec Delta: component-library-packaging

## ADDED Requirements

### Requirement: Dual Distribution Options in Documentation

The library documentation and distribution artifacts SHALL provide parallel onboarding instructions for both compiled npm package installation (`theoui`) and source-level component installation via the shadcn CLI (`shadcn add @theoui/<component>`).

#### Scenario: Consumer onboarding via CLI registry
- **WHEN** a developer prefers source-level code ownership and selective installation
- **THEN** the primary documentation guides configuring the `@theoui` registry in `components.json` and executing `shadcn add` for specific components

#### Scenario: Preserving compiled npm package workflow
- **WHEN** an enterprise project prefers a single versioned npm dependency
- **THEN** `npm install theoui` continues to provide the complete compiled ESM package with precompiled CSS and subpath exports without regression
