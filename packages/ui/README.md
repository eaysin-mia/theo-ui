# @workspace/ui

An accessible React component library built on [Base UI](https://base-ui.com)
and styled with [Tailwind CSS v4](https://tailwindcss.com).

The package publishes ESM JavaScript, TypeScript declarations, and a Tailwind
stylesheet. `apps/web` is the workspace consumer and showcase application.

## Requirements

- React and React DOM 19 or later
- Tailwind CSS v4 with a CSS pipeline that processes Tailwind directives

## Install

```bash
pnpm add @workspace/ui
```

## Styles

Import the package stylesheet once from your application's global CSS entry:

```css
@import "@workspace/ui/globals.css";
```

The stylesheet imports Tailwind, the library theme tokens, font and animation
styles, and scans the package's built components for utility classes. Tailwind
scans your application sources automatically when the CSS build runs from the
application directory. If your build runs from the monorepo root, configure the
application source path with Tailwind's `source()` or `@source` directives.

The stylesheet includes global base styles, so import it only once. You can
override the theme through the CSS variables defined by the library.

## Import components

Use the root entry point for convenience:

```tsx
import { Button, Dialog, Input, Tooltip } from "@workspace/ui";
```

Or import a focused component group:

```tsx
import { Button } from "@workspace/ui/components/button";
import { EventCalendar } from "@workspace/ui/components/event-calendar";
import { Gantt, GanttView } from "@workspace/ui/components/gantt";
import { Tree, TreeItem, TreeItemLabel } from "@workspace/ui/components/tree";
import { cn } from "@workspace/ui/lib/utils";
import { useMediaQuery } from "@workspace/ui/hooks";
```

Authentication components and helpers are separate entry points:

```tsx
import { AuthProvider, SignIn } from "@workspace/ui/components/auth";
import { adminPlugin, passkeyPlugin } from "@workspace/ui/lib/auth";
```

These authentication entry points use Better Auth UI and Better Auth APIs.
Specialized components may also require their documented integration
dependencies.

## Composition

Components built on Base UI use its `render` prop for element composition:

```tsx
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export function NavLink() {
  return <Button render={<Link href="/dashboard" />}>Go to Dashboard</Button>;
}
```

## Workspace development

From the repository root:

```bash
pnpm install
pnpm dev
```

The package can also be built, checked, and linted independently:

```bash
pnpm --filter @workspace/ui build
pnpm --filter @workspace/ui typecheck
pnpm --filter @workspace/ui lint
```
