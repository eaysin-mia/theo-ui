# Spec Delta: turborepo-workspace-architecture

## ADDED Requirements

### Requirement: Component Library Testing Pipeline

The repository SHALL provide automated unit and component testing powered by Vitest, React Testing Library, and jsdom, supporting both single-run CI execution (`pnpm test` / `vitest run`) and interactive watch development (`pnpm test:watch`).

#### Scenario: Running component tests across monorepo
- **WHEN** a developer executes `pnpm test` from the monorepo root
- **THEN** Turborepo executes package tests in dependency order and reports test suite results

#### Scenario: Executing isolated component unit tests
- **WHEN** running tests for `@theo/ui` components
- **THEN** Vitest executes co-located test files using jsdom with global DOM polyfills and React cleanup hooks

### Requirement: Test Artifact Isolation and Build Protection

The build pipeline SHALL exclude test files (`*.test.ts`, `*.test.tsx`) and test setup directories from compiled distribution outputs (`dist/`), ensuring zero test code or test types are published to registry consumers.

#### Scenario: Compiling package with co-located tests
- **WHEN** the package build executes `pnpm build` in `@theo/ui`
- **THEN** TypeScript compiles only production source files to `dist/`, omitting `.test.js` and `.test.d.ts` files
