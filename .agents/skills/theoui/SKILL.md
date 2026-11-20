---
name: theoui
description: Helps implement theoui UI, authentication, and advanced components correctly. Use when building UIs with theoui primitives and domain widgets (Gantt, Kanban, EventCalendar, Filters, Composer, Chat Feed, AutoHeight), Better Auth views and plugins (SignIn, SignUp, Settings, Organization, AdminUsers), or verifying Server vs Client Component boundaries.
compatibility: Requires React 19, Tailwind CSS v4, Base UI (@base-ui/react), and Better Auth.
license: MIT
metadata:
  author: Eaysin
  version: "0.2.0"
---

# theoui

`theoui` is an accessible, unstyled-first UI component and authentication library built on Base UI, Better Auth, and Tailwind CSS v4.

## Layered Skill Architecture

To keep guidance fast, modular, and token-efficient, the UI ecosystem is organized into 3 complementary layers:

1. **`theoui` (this skill)**:
   Authoritative guidance on package entrypoints, React Server Component (RSC) boundaries, the Better Auth UI system (`theoui/auth` and `theoui/auth/lib`), general utilities (`theoui/lib`), and advanced domain components (`Gantt`, `Kanban`, `EventCalendar`, `Filters`, `Composer`, `Chat Feed`, `AutoHeight`, micro-buttons).
2. **`coss` (`.agents/skills/coss/`)**:
   Standard Base UI unstyled primitive mechanics (Button, Dialog, Select, Popover, Menu, Tooltip, Drawer, Input, Checkbox, Slider, Tabs, etc.). When implementing basic primitives, follow the `coss` skill.
3. **`coss-particles` (`.agents/skills/coss-particles/`)**:
   Index of copy-paste-ready composed particle patterns (login cards, pricing tables, metric cards, stat grids) at `https://coss.com/ui/particles`.

---

## The 5 Public Subpath Exports

Never import from internal directories (such as `theoui/components/*` or `theoui/utils`). Always use the 5 public subpaths:

| Subpath | Description | Example |
| :--- | :--- | :--- |
| **`"theoui"`** | All general UI components, layouts, and advanced widgets | `import { Button, Dialog, Gantt, Kanban, Drawer } from "theoui";` |
| **`"theoui/auth"`** | Better Auth forms, views, user buttons, and client hooks | `import { SignIn, SignUp, UserButton, Settings } from "theoui/auth";` |
| **`"theoui/auth/lib"`** | Better Auth client plugins and adapters | `import { adminPlugin, organizationPlugin } from "theoui/auth/lib";` |
| **`"theoui/hooks"`** | Reusable React hooks | `import { useMediaQuery, useAutoHeight } from "theoui/hooks";` |
| **`"theoui/lib"`** | Utilities (`cn`, syntax highlighter, composer helpers) | `import { cn } from "theoui/lib";` |
| **`"theoui/styles.css"`** | Precompiled Tailwind CSS v4 stylesheet | `@import "theoui/styles.css";` |

---

## Core Invariants

1. **Polymorphic `render` prop (never `asChild`):**
   Base UI components do not use Radix's `asChild`. Always use `render`:
   ```tsx
   <Button render={<Link href="/dashboard" />}>Dashboard</Button>
   ```

2. **React Server Components (RSC) Boundaries:**
   - `"theoui"` entrypoint has **NO** `"use client"`. Server components (`Card`, `Badge`, `Separator`, `Skeleton`, `Table`) remain pure Server Components.
   - `"theoui/auth"` entrypoint **HAS** `"use client"`. Authentication views (`SignIn`, `SignUp`, `Settings`, `Organization`, `AdminUsers`) are interactive Client Components and safe to import into Server Component pages.

3. **Drawer Replaces Sheet:**
   `Sheet` has been unified into `Drawer`. Use `Drawer` for all edge slide-over panels.

4. **Tailwind CSS v4 Styling:**
   - Use semantic OKLCH tokens (`bg-background`, `text-foreground`, `border-border`).
   - Do NOT replace `--alpha()` in CSS variables.

---

## Detailed Rule Guides

Consult specific guides for in-depth patterns:
- [auth.md](./references/rules/auth.md) — Complete Better-Auth views, hooks, and 28 plugins
- [advanced-components.md](./references/rules/advanced-components.md) — Gantt, Kanban, EventCalendar, Filters, Composer, Chat, AutoHeight
- [lib.md](./references/rules/lib.md) — `cn`, syntax highlighter, and composer document helpers
- [imports.md](./references/rules/imports.md) — Subpath mapping and anti-patterns
- [composition.md](./references/rules/composition.md) — Trigger + popup contracts
- [styling.md](./references/rules/styling.md) — Tokens, sizing, and data-slot selectors
- [rsc.md](./references/rules/rsc.md) — Server Component vs Client Component architecture
