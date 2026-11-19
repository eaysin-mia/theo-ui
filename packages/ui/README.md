# theoui

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

Install `theoui` into your project using your preferred package manager:

```bash
# pnpm
pnpm add theoui

# npm
npm install theoui

# yarn
yarn add theoui

# bun
bun add theoui
```

All core primitives (Button, Dialog, Select, Tabs, Input, Tooltip, Form, etc.) work immediately with zero additional dependencies.

---

### Optional Feature Dependencies

`theoui` isolates heavy or domain-specific libraries behind optional peer dependencies and subpath exports. Install these only when using the respective feature in your application:

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

To update `theoui` to the latest release in your project:

```bash
# pnpm
pnpm update theoui@latest

# npm
npm install theoui@latest

# yarn
yarn upgrade theoui@latest

# bun
bun update theoui
```

---

## Setup & Styles

### 1. Global Stylesheet

Import the library stylesheet once in your application's root CSS entry point (e.g. `src/app/globals.css` in Next.js or `src/index.css` in Vite):

```css
@import "theoui/globals.css";
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
import "theoui/globals.css";
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

When consuming `theoui` directly from a local monorepo workspace before publishing to npm, configure `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["theoui"],
};

export default nextConfig;
```

_(Note: Once `theoui` is installed from the npm registry as a pre-built package, `transpilePackages` is not required)._

---

## Importing Components & Subpaths

`theoui` provides fully typed subpath exports for optimal tree-shaking:

### Root Entrypoint

```tsx
import { Button, Dialog, Input, Tooltip, Badge } from "theoui";
```

### Granular Primitive Imports

```tsx
import { Button } from "theoui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "theoui/components/dialog";
import { Select, SelectItem, SelectTrigger } from "theoui/components/select";
```

### High-level Patterns & Interactive Organisms

```tsx
import { CartButton } from "theoui/patterns/buttons/cart-button";
import { HoldButton } from "theoui/patterns/buttons/hold-button";
import { TipSelector } from "theoui/patterns/tip-selector";
import { HaloSearchInput } from "theoui/patterns/halo-search";
import { EventCalendar } from "theoui/patterns/event-calendar";
import { Gantt, GanttView } from "theoui/patterns/gantt";
import { Tree, TreeItem, TreeItemLabel } from "theoui/patterns/tree";
```

### Utility Hooks & Helpers

```tsx
import { useMediaQuery, useIsMobile, useIsHydrated } from "theoui/hooks";
import { cn } from "theoui/lib/utils";
```

### Authentication Primitives

```tsx
import { AuthProvider, SignIn, SignUp } from "theoui/components/auth";
import { adminPlugin, passkeyPlugin } from "theoui/lib/auth";
```

---

## Composition with Base UI `render`

All components built on Base UI use the polymorphic `render` prop for element composition instead of `asChild`:

```tsx
import Link from "next/link";
import { Button } from "theoui/components/button";

export function NavLink() {
  return <Button render={<Link href="/dashboard" />}>Go to Dashboard</Button>;
}
```

---

## Workspace Development & Publishing

From the monorepo root:

```bash
# Build the package (TypeScript declarations + Tailwind CSS)
pnpm --filter theoui build

# Typecheck
pnpm --filter theoui typecheck

# Lint
pnpm --filter theoui lint

# Validate exports and package structure with publint
pnpm --filter theoui package:check
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
