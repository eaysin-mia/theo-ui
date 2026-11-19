# @theo/ui

An accessible, unstyled-first React component library built on [Base UI](https://base-ui.com) and styled with [Tailwind CSS v4](https://tailwindcss.com).

Published as modern ES Modules (ESM) with first-class TypeScript declarations, subpath exports for optimal tree-shaking, and a precompiled Tailwind stylesheet.

---

## Requirements & Peer Dependencies

- **Node.js**: `>=20.9.0`
- **React & React DOM**: `^19.0.0`
- **Tailwind CSS**: `^4.0.0` (with CSS pipeline processing `@import` directives)

---

## Installation

### Core Package

Install `@theo/ui` into your project using your preferred package manager:

```bash
# pnpm
pnpm add @theo/ui

# npm
npm install @theo/ui

# yarn
yarn add @theo/ui

# bun
bun add @theo/ui
```

All core primitives (Button, Dialog, Select, Tabs, Input, Tooltip, Form, etc.) work immediately with zero additional dependencies.

---

### Optional Feature Dependencies

`@theo/ui` isolates heavy or domain-specific libraries behind optional peer dependencies and subpath exports. Install these only when using the respective feature in your application:

| Feature / Subpath                                                                                                               | Required Peer Package(s)                                           | Install Command                                                   |
| :------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------- | :---------------------------------------------------------------- |
| **Motion & Micro-interactions**<br>_(`CartButton`, `HoldButton`, `UndoButton`, `AutoHeight`, `HaloSearchInput`, `TipSelector`)_ | `motion`                                                           | `pnpm add motion`                                                 |
| **Authentication UI**<br>_(`AuthProvider`, `SignIn`, `OAuthConsent`, Passkeys)_                                                 | `better-auth`<br>`@better-auth-ui/react`<br>`@better-auth-ui/core` | `pnpm add better-auth @better-auth-ui/react @better-auth-ui/core` |
| **Data Tables**<br>_(`DataTable`)_                                                                                              | `@tanstack/react-table`                                            | `pnpm add @tanstack/react-table`                                  |
| **Charts**<br>_(`ChartContainer`, `ChartTooltip`)_                                                                              | `recharts`                                                         | `pnpm add recharts`                                               |
| **Code Highlighting**<br>_(`CodeBlock`, `useHighlightedCode`)_                                                                  | `shiki`                                                            | `pnpm add shiki`                                                  |
| **QR Code Generation**<br>_(`QrCode`)_                                                                                          | `qrcode`<br>`@types/qrcode`                                        | `pnpm add qrcode`                                                 |

#### Feature Installation Quick Recipes

```bash
# 1. Motion & Interactive Animations
pnpm add motion

# 2. Better Auth UI
pnpm add better-auth @better-auth-ui/react @better-auth-ui/core

# 3. Data Tables
pnpm add @tanstack/react-table

# 4. Charts & Analytics
pnpm add recharts

# 5. Syntax Highlighting
pnpm add shiki

# 6. QR Code Generation
pnpm add qrcode
```

---

## Updating the Package

To update `@theo/ui` to the latest release in your project:

```bash
# pnpm
pnpm update @theo/ui@latest

# npm
npm install @theo/ui@latest

# yarn
yarn upgrade @theo/ui@latest

# bun
bun update @theo/ui
```

---

## Setup & Styles

### 1. Global Stylesheet

Import the library stylesheet once in your application's root CSS entry point (e.g. `src/app/globals.css` in Next.js or `src/index.css` in Vite):

```css
@import "@theo/ui/globals.css";
```

The stylesheet imports Tailwind CSS, design tokens, CSS custom properties, and animations. You can customize colors and variables directly via `:root` and `.dark` overrides in your CSS.

### 2. Motion & Accessibility Provider

For applications using animated components (`CartButton`, `HoldButton`, `TipSelector`, `HaloSearchInput`), wrap your app in Motion's `<MotionConfig>` to control motion and accessibility preferences:

```tsx
// components/motion-provider.tsx
"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

Add the provider in your root layout (`app/layout.tsx`):

```tsx
import "@theo/ui/globals.css";
import { MotionProvider } from "@/components/motion-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
```

### 3. Next.js Monorepo Configuration

When consuming `@theo/ui` directly from a local monorepo workspace before publishing to npm, configure `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@theo/ui"],
};

export default nextConfig;
```

_(Note: Once `@theo/ui` is installed from the npm registry as a pre-built package, `transpilePackages` is not required)._

---

## Importing Components & Subpaths

`@theo/ui` provides fully typed subpath exports for optimal tree-shaking:

### Root Entrypoint

```tsx
import { Button, Dialog, Input, Tooltip, Badge } from "@theo/ui";
```

### Granular Primitive Imports

```tsx
import { Button } from "@theo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@theo/ui/components/dialog";
import { Select, SelectItem, SelectTrigger } from "@theo/ui/components/select";
```

### High-level Patterns & Interactive Organisms

```tsx
import { CartButton } from "@theo/ui/patterns/buttons/cart-button";
import { HoldButton } from "@theo/ui/patterns/buttons/hold-button";
import { TipSelector } from "@theo/ui/patterns/tip-selector";
import { HaloSearchInput } from "@theo/ui/patterns/halo-search";
import { EventCalendar } from "@theo/ui/patterns/event-calendar";
import { Gantt, GanttView } from "@theo/ui/patterns/gantt";
import { Tree, TreeItem, TreeItemLabel } from "@theo/ui/patterns/tree";
```

### Utility Hooks & Helpers

```tsx
import { useMediaQuery, useIsMobile, useIsHydrated } from "@theo/ui/hooks";
import { cn } from "@theo/ui/lib/utils";
```

### Authentication Primitives

```tsx
import { AuthProvider, SignIn, SignUp } from "@theo/ui/components/auth";
import { adminPlugin, passkeyPlugin } from "@theo/ui/lib/auth";
```

---

## Composition with Base UI `render`

All components built on Base UI use the polymorphic `render` prop for element composition instead of `asChild`:

```tsx
import Link from "next/link";
import { Button } from "@theo/ui/components/button";

export function NavLink() {
  return <Button render={<Link href="/dashboard" />}>Go to Dashboard</Button>;
}
```

---

## Workspace Development & Publishing

From the monorepo root:

```bash
# Build the package (TypeScript declarations + Tailwind CSS)
pnpm --filter @theo/ui build

# Typecheck
pnpm --filter @theo/ui typecheck

# Lint
pnpm --filter @theo/ui lint

# Validate exports and package structure with publint
pnpm --filter @theo/ui package:check
```

### Publishing Releases

This library uses Changesets for versioning and publishing:

1. Create a changeset describing your change:
   ```bash
   pnpm changeset
   ```
2. Bump version in `package.json` and generate changelog:
   ```bash
   pnpm version-packages
   ```
3. Build and publish:
   ```bash
   pnpm release
   ```
