# UI workspace

This pnpm/Turborepo workspace contains an installable React UI package and a
Next.js application that consumes and demonstrates it.

- [`packages/ui`](./packages/ui/README.md) contains the UI library, build
  instructions, component imports, and Tailwind setup.
- `apps/web` is the example consumer and application.

## Development

```bash
pnpm install
pnpm dev
```

## Package checks

```bash
pnpm --filter @workspace/ui build
pnpm --filter @workspace/ui typecheck
pnpm --filter @workspace/ui lint
```
