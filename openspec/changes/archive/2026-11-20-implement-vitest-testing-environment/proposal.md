# Proposal

## Why

The repository currently lacks an automated unit and component testing pipeline, leaving regressions in component behavior, accessibility, and event handling undetectable until runtime or production. Introducing a high-performance Vitest testing environment establishes fast, reliable verification across our UI component library and monorepo pipeline.

## What Changes

- Install and configure **Vitest** with `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, and `jsdom` in `packages/ui`.
- Adopt the industry-standard **hybrid testing structure**:
  - **Co-located unit tests** (`packages/ui/src/components/<name>.test.tsx`) alongside source files for maximum developer experience, modularity, and atomic refactoring.
  - **Centralized test setup** (`packages/ui/tests/setup.ts`) for global DOM polyfills (`ResizeObserver`, `IntersectionObserver`, `matchMedia`) and cleanup hooks.
- Protect the build pipeline by configuring `packages/ui/tsconfig.build.json` to strictly exclude `**/*.test.ts*` and `tests/`, ensuring zero test files or test declarations leak into the published `dist/` bundle.
- Add Turborepo task pipeline support (`"test": { "dependsOn": ["^build"] }`) in `turbo.json` and a root script `"test": "turbo test"`.
- Add foundational component test suites for core primitives (`Button`, `Badge`).
- Integrate automated testing into the GitHub Actions CI workflow (`.github/workflows/ci.yml`).

## Capabilities

### New Capabilities
<!-- No new standalone capabilities -->

### Modified Capabilities
- `turborepo-workspace-architecture`: Adds requirements for automated monorepo test execution and component library test isolation contracts.

## Impact

- **Dependencies**: Adds devDependencies (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`) to `packages/ui`.
- **Build & TypeScript**: Updates `packages/ui/tsconfig.build.json` with test exclusions.
- **Task Pipeline**: Adds `test` task to `turbo.json` and root `package.json`.
- **CI Pipeline**: Adds `pnpm turbo test` to `.github/workflows/ci.yml`.
