# Design

## Context

`@theo/ui` is an unbundled, ESM-first React 19 component library. Currently, it relies on static typechecking (`tsc --noEmit`), linting (`eslint`), and formatting (`prettier`), but lacks an automated runtime testing environment. 

We need to establish an automated testing foundation using Vitest (matching the guidance in `.agents/skills/vitest-skill/SKILL.md` and `playbook.md`) that maximizes developer experience, prevents regressions, and guarantees that test files do not leak into published npm releases.

## Goals / Non-Goals

**Goals:**
- Provide sub-second test execution and watch mode with Vitest and `@vitejs/plugin-react`.
- Configure `@testing-library/react` and `@testing-library/jest-dom` in a `jsdom` environment with global polyfills (`ResizeObserver`, `IntersectionObserver`, `matchMedia`).
- Adopt the **dedicated `tests/` directory structure**: all component test suites reside under `tests/components/<name>.test.tsx` with clean module imports (`@theo/ui/components/<name>`), keeping `src/` 100% pure production code.
- Ensure `tsconfig.build.json` strictly excludes all test files so `dist/` contains zero test code or `.test.d.ts` declarations.
- Integrate test execution into `turbo.json` and `.github/workflows/ci.yml`.

**Non-Goals:**
- End-to-end browser testing (Playwright/Cypress) in this change.
- Visual regression snapshot testing across all 70+ components in this initial setup.

## Decisions

### Decision 1: Test Folder Structure — Dedicated `tests/` Directory

We evaluated organization structures for test files and implemented the **Dedicated `tests/` Directory Structure**:

1. **Architecture Layout**:
   * `packages/ui/src/`: Contains 100% production code and component exports.
   * `packages/ui/tests/components/`: Contains all component test suites (e.g., `tests/components/button.test.tsx`, `tests/components/badge.test.tsx`).
   * `packages/ui/tests/setup.ts`: Central setup for DOM polyfills (`ResizeObserver`, `IntersectionObserver`, `matchMedia`) and `@testing-library/react` cleanup.
2. **Clean Import Paths via Path Alias**:
   * Rather than cumbersome relative paths (`../../src/components/button`), Vitest's `resolve.alias` is configured so test files import cleanly via:
     ```tsx
     import { Button } from "@theo/ui/components/button";
     ```
3. **Benefits**:
   * Zero ambiguity in `src/`: source tree is exclusively publishable component files.
   * Total guarantee that TypeScript compilation for distribution (`tsconfig.build.json`) will not touch or emit any test code.

### Decision 2: Build Leakage Protection

We ensure `tsconfig.build.json` strictly excludes tests:
```json
// packages/ui/tsconfig.build.json
"exclude": [
  "node_modules",
  "dist",
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/**/*.spec.ts",
  "src/**/*.spec.tsx",
  "tests/**/*"
]
```
This guarantees that `pnpm build` emits clean, publishable library artifacts.

### Decision 3: Turborepo Pipeline Integration

In `turbo.json`:
```json
"test": {
  "dependsOn": ["^build"]
}
```
Component tests execute in parallel with smart Turborepo caching.

## Risks / Trade-offs

- **Risk**: Test files could accidentally get imported into production source code.
- **Mitigation**: ESLint and TypeScript will flag any circular or illegal test imports.
