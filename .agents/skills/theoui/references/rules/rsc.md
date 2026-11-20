# React Server Components (RSC) Architecture

Use this guide to understand how `theoui` operates across Server Components and Client Components in Next.js App Router.

## Package Boundary Philosophy

Next.js App Router enforces strict boundaries between server code and client code. In `theoui`:

### 1. Root Package `"theoui"` is RSC-Neutral
- The root entrypoint (`packages/ui/src/index.ts`) **DOES NOT** declare `"use client"`.
- This ensures that pure presentation components remain native Server Components:
  - `Card`, `CardHeader`, `CardTitle`, `CardPanel`
  - `Badge`
  - `Separator`
  - `Skeleton`
  - `Table`, `TableHeader`, `TableRow`, `TableCell`
  - `Item`, `Frame`, `Timeline`
- Interactive components (`Button`, `Dialog`, `Select`, `Input`, `Drawer`) declare `"use client"` inside their own component files.
- **Benefit:** When a Server Component in Next.js imports `{ Card, Badge } from "theoui"`, they render entirely on the server with **zero client JavaScript**.

### 2. Auth Subpath `"theoui/auth"` is a Client Boundary
- The auth entrypoint (`packages/ui/src/auth/index.ts`) **DOES** declare `"use client"`.
- All authentication features (`SignIn`, `SignUp`, `Settings`, `Organization`, `AdminUsers`, `useSession`, `useAuth`) are inherently interactive and depend on `@better-auth-ui/react` contexts.
- By having `"use client"` on the `"theoui/auth"` entrypoint, Next.js knows that any Server Component (like an async catch-all page `app/(dashboard)/settings/[...path]/page.tsx`) importing `<Settings />` or `<Organization />` is creating a Client Reference.
- Next.js does not evaluate client context on the server, avoiding runtime `createContext is not a function` errors.

---

## Best Practices for Consumers

```tsx
// app/dashboard/page.tsx (Server Component)
import { Card, CardHeader, CardTitle, CardPanel, Badge } from "theoui";
import { UserButton } from "theoui/auth";

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Server Components: Rendered on server, zero client bundle cost */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <Badge variant="outline">Server Rendered</Badge>
        </CardHeader>
        <CardPanel>Dashboard Overview</CardPanel>
      </Card>

      {/* Client Component: Transparently rendered via client boundary */}
      <UserButton />
    </div>
  );
}
```
