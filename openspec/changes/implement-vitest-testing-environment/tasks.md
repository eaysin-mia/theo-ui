# Tasks

## 1. Environment Configuration

- [x] 1.1 Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `@vitejs/plugin-react` as devDependencies in `packages/ui`.
- [x] 1.2 Create `packages/ui/vitest.config.ts` configured for React, jsdom, path aliases, and the setup file.
- [x] 1.3 Create centralized `packages/ui/tests/setup.ts` with global DOM polyfills (`ResizeObserver`, `IntersectionObserver`, `matchMedia`) and `@testing-library/react` cleanup hooks.

## 2. Build Protection and Scripting

- [x] 2.1 Update `packages/ui/tsconfig.build.json` to strictly exclude `src/**/*.test.ts*` and `tests/` from compiled distribution outputs.
- [x] 2.2 Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `packages/ui/package.json`.
- [x] 2.3 Configure `"test": { "dependsOn": ["^build"] }` in `turbo.json` and `"test": "turbo test"` in root `package.json`.

## 3. Foundational Component Tests

- [x] 3.1 Create separate `packages/ui/tests/components/button.test.tsx` covering click events, variants, disabled attributes, and loading indicators.
- [x] 3.2 Create separate `packages/ui/tests/components/badge.test.tsx` covering variants, sizes, and default content.

## 4. Pipeline & Verification

- [x] 4.1 Add `- name: Test` running `pnpm turbo test` to `.github/workflows/ci.yml`.
- [x] 4.2 Run `pnpm test` and confirm all component test suites pass with exit code 0.
- [x] 4.3 Run `pnpm --filter @theo/ui build` and verify that zero `.test.js` or `.test.d.ts` files exist in `packages/ui/dist/`.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
