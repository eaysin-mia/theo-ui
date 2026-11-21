# theoui

## 0.3.0

### Minor Changes

- - Add dedicated server-safe email templates subpath `theoui/auth/email` for React Email templates.
  - Isolate `theoui/auth` with `"use client"` boundary to avoid React context hydration crashes in Next.js Server Components.
  - Promote `motion` to direct dependencies to eliminate runtime module resolution errors.
  - Internal refactor to use standardized `#` subpath aliases (`#components/*`, `#auth/*`, `#lib/*`, `#hooks/*`).
  - Deprecate `Sheet` in favor of `Drawer` with IDE JSDoc guidance.
  - Add comprehensive 3-tier LLM documentation (`llms.txt`, `llms-full.txt`) and agent skills.

## 0.2.0

### Minor Changes

- 629ac78: Consolidate pattern components into components, isolate auth to /auth, and simplify package exports.

## 0.1.0

### Minor Changes

- Initial public release of theoui component library
