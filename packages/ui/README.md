# theoui

An accessible, unstyled-first React component library built on [Base UI](https://base-ui.com) and styled with [Tailwind CSS v4](https://tailwindcss.com).

Published as modern ES Modules (ESM) with first-class TypeScript declarations, tree-shakeable subpath exports, and a precompiled stylesheet.

---

## Requirements

- **Node.js**: `>=20.9.0`
- **React & React DOM**: `^19.0.0`
- **Tailwind CSS**: `^4.0.0` (with CSS processing `@import` directives)

---

## Quick Start

### 1. Install

```bash
npm install theoui
# or
pnpm add theoui
# or
yarn add theoui
# or
bun add theoui
```

### 2. Import Styles

Import the precompiled stylesheet once in your application's root CSS file (e.g. `app/globals.css` in Next.js or `src/index.css` in Vite):

```css
@import "theoui/styles.css";
```

### 3. Use Components

```tsx
import { Button, Card, TipSelector } from "theoui";

export default function App() {
  return (
    <Card className="p-6 space-y-4">
      <Button variant="primary">Click Me</Button>
      <TipSelector />
    </Card>
  );
}
```

---

## Subpath Imports

`theoui` provides clean, fully-typed entrypoints for optimal tree-shaking:

| Entrypoint                   | Description                             | Example                                                       |
| :--------------------------- | :-------------------------------------- | :------------------------------------------------------------ |
| **`"theoui"`**               | All UI components, buttons, and layouts | `import { Button, Dialog, TipSelector, Gantt } from "theoui"` |
| **`"theoui/auth"`**          | Better Auth forms, buttons, and views   | `import { SignIn, SignUp, UserButton } from "theoui/auth"`    |
| **`"theoui/auth/lib"`**      | Auth plugins and client adapters        | `import { adminPlugin, twoFactorPlugin } from "theoui/auth/lib"` |
| **`"theoui/hooks"`**         | Reusable hooks                          | `import { useMediaQuery, useDebounce } from "theoui/hooks"`   |
| **`"theoui/lib"`**           | General lib and utilities (`cn`, etc.)  | `import { cn } from "theoui/lib"`                             |
| **`"theoui/styles.css"`**    | Precompiled Tailwind CSS styles         | `@import "theoui/styles.css";`                                |

---

## Composition with Base UI `render`

All components built on Base UI use the polymorphic `render` prop for element composition instead of `asChild`:

```tsx
import Link from "next/link";
import { Button } from "theoui";

export function NavLink() {
  return <Button render={<Link href="/dashboard" />}>Go to Dashboard</Button>;
}
```

---

## Optional Peer Dependencies

All core components work out of the box with zero required peer dependencies beyond React 19. Install optional peer packages only when using these specific features:

| Feature                 | Components                                       | Install Command                                                   |
| :---------------------- | :----------------------------------------------- | :---------------------------------------------------------------- |
| **Motion Animations**   | `CartButton`, `HoldButton`, `AutoHeight`         | `pnpm add motion`                                                 |
| **Authentication UI**   | `theoui/auth` (`SignIn`, `SignUp`, `UserButton`) | `pnpm add better-auth @better-auth-ui/react @better-auth-ui/core` |
| **Data Tables**         | `DataTable`                                      | `pnpm add @tanstack/react-table`                                  |
| **Charts**              | `ChartContainer`, `ChartTooltip`                 | `pnpm add recharts`                                               |
| **Syntax Highlighting** | `CodeBlock`                                      | `pnpm add shiki`                                                  |
| **QR Code**             | `QrCode`                                         | `pnpm add qrcode`                                                 |

---

## License

MIT © [Eaysin](https://github.com/eaysin-mia)
