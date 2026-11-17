# Theo UI workspace

Private React UI package and Next.js example application.

## Adding components

To add shadcn components to the shared package, run this at the workspace root:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

The configured aliases point component installation at `packages/ui/src/components`.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@theo/ui/button";
```

The private package is built from `packages/ui` and published to the restricted
scope registry. See [packages/ui/README.md](./packages/ui/README.md) for
installation, optional feature dependencies, and stylesheet usage.
