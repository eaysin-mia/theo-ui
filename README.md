# UI Workspace

This pnpm and Turborepo monorepo contains `theoui`, an enterprise React 19 component library, and a Next.js 16 application (`apps/web`) demonstrating and validating all components and patterns.

- [`packages/ui`](./packages/ui/README.md) – Standalone, publishable UI library built on Base UI and Tailwind CSS v4.
- `apps/web` – Next.js 16 showcase application and playground.
- `packages/eslint-config` – Shared ESLint flat configurations.
- `packages/typescript-config` – Shared TypeScript configurations.

## Development

```bash
# Install dependencies
pnpm install

# Start development server (Turbopack)
pnpm dev

# Build all packages and apps
pnpm build
```

## Quality & Checks

```bash
# Typecheck all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format check
pnpm format:check

# Validate UI package exports and publish readiness
pnpm --filter theoui package:check
```

## Releasing & Publishing

This repository uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management:

```bash
# 1. Generate a changeset when making modifications
pnpm changeset

# 2. Bump versions across packages based on changesets
pnpm version-packages

# 3. Build, verify, and publish to npm / GitHub Packages
pnpm release
```
