# coss UI Upstream Sync Guide

This document tracks upstream synchronization for vendored coss UI components and registry particles.

## Upstream Sources

- **coss UI Registry**: `https://coss.com/ui/r/{name}.json`
- **Official Docs**: `https://coss.com/ui`
- **Repository**: `https://github.com/cosscom/ui`

## Folder Structure & Separation of Origins

- `src/components/`: Strict mirror of upstream CLI-installed coss components (`@coss/*`). **Do NOT edit files in this directory directly.**
- `src/components/auth/` & `src/lib/auth/`: Better Auth UI registry items (`@better-auth-ui/*`).
- `src/patterns/`: Custom internal components, composites, and team-authored recipes.
- `src/base-ui/`: Direct re-exports of Base UI primitives (`@base-ui/react`).

## Syncing / Updating Upstream Components

To inspect upstream diffs before updating:

```bash
cd packages/ui
pnpm dlx shadcn@latest add @coss/<component-name> --diff
```

To update / overwrite a component:

```bash
cd packages/ui
pnpm dlx shadcn@latest add @coss/<component-name> --overwrite
```

## Upstream Sync Log

| Date       | Item                   | Command / Registry       | Notes                          |
| :--------- | :--------------------- | :----------------------- | :----------------------------- |
| 2026-11-18 | `@coss/ui`             | Initial registry install | Base UI primitives             |
| 2026-11-18 | `@better-auth-ui/auth` | Initial registry install | Authentication views & plugins |
