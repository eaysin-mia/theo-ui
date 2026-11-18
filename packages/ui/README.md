# @workspace/ui

An accessible, unstyled-first UI component library built on [Base UI](https://base-ui.com) and styled with [Tailwind CSS v4](https://tailwindcss.com).

## Highlights

- **Base UI Primitives**: Built entirely with `@base-ui/react` unstyled primitives using the `render` prop composition model (`useRender` & `mergeProps`).
- **Tailwind CSS v4**: Modern CSS-first architecture using native `@theme`, `@source`, and `--alpha()` color tokens.
- **Tree-shakeable**: Modular subpath exports (`@workspace/ui/components/*`, `@workspace/ui/hooks`, `@workspace/ui/lib`).
- **Better Auth UI**: Integrated first-class authentication views and plugins powered by `@better-auth-ui/react`.
- **Zero Mock / Hardcoded State**: Pure presenter components with fully decoupled caller props and strict TypeScript types.

---

## Installation

```bash
# Using pnpm
pnpm add @workspace/ui

# Using npm
npm install @workspace/ui

# Using yarn
yarn add @workspace/ui
```

### Peer Dependencies

Ensure your project has React 19 installed:

```json
{
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0"
  }
}
```

---

## Tailwind CSS v4 Configuration

In your main CSS entrypoint (e.g. `globals.css` or `app.css`), include the styles and ensure Tailwind scans the UI package:

```css
@import "tailwindcss";
@import "@workspace/ui/globals.css";

/* Ensure Tailwind v4 scans the library source for utility classes */
@source "../node_modules/@workspace/ui/src/**/*.{ts,tsx}";
```

---

## Usage

### 1. Root Imports

```tsx
import { Button, Input, Dialog, Tooltip } from "@workspace/ui";
```

### 2. Subpath Imports (Optimized Tree-Shaking)

```tsx
// Components
import { Button } from "@workspace/ui/components/button";
import { Tree, TreeItem, TreeItemLabel } from "@workspace/ui/components/tree";
import { Gantt, GanttView } from "@workspace/ui/components/gantt";
import { EventCalendar } from "@workspace/ui/components/event-calendar";

// Utilities & Hooks
import { cn } from "@workspace/ui/lib/utils";
import { useMediaQuery } from "@workspace/ui/hooks";

// Auth Components & Plugins
import { AuthProvider } from "@workspace/ui/components/auth";
import { adminPlugin, passkeyPlugin } from "@workspace/ui/lib/auth";
```

### 3. Composition with `render` Prop

All Coss UI components use the Base UI `render` prop pattern rather than Radix `asChild`:

```tsx
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function NavLink() {
  return (
    <Button render={<Link href="/dashboard" />}>
      Go to Dashboard
    </Button>
  );
}
```

---

## License

MIT
