# Authentication Rules & Patterns (theoui/auth & theoui/auth/lib)

Use this guide when building authentication flows, settings, organization workspaces, and user management with Better Auth and `theoui`.

## Subpath Division

- **`"theoui/auth"`**: UI components, views, forms, dialogs, user avatars, and client hooks.
- **`"theoui/auth/lib"`**: Better Auth client plugins and adapter builders.

---

## 1. Auth Provider Setup

Configure the application auth provider wrapping the app root:

```tsx
// components/auth-provider.tsx
"use client";

import { AuthProvider } from "theoui/auth";
import {
  adminPlugin,
  agentAuthPlugin,
  anonymousPlugin,
  apiKeyPlugin,
  billingPlugin,
  deleteUserPlugin,
  deviceAuthorizationPlugin,
  emailOtpPlugin,
  lastLoginMethodPlugin,
  magicLinkPlugin,
  multiSessionPlugin,
  oauthProviderPlugin,
  organizationPlugin,
  passkeyPlugin,
  phoneNumberPlugin,
  siwePlugin,
  ssoPlugin,
  themePlugin,
  twoFactorPlugin,
  usernamePlugin,
} from "theoui/auth/lib";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const plugins = useMemo(() => [
    adminPlugin(),
    organizationPlugin(),
    twoFactorPlugin(),
    passkeyPlugin(),
    apiKeyPlugin(),
    ssoPlugin(),
    magicLinkPlugin(),
  ], []);

  return (
    <AuthProvider client={authClient} plugins={plugins}>
      {children}
    </AuthProvider>
  );
}
```

---

## 2. Core Auth Views

### Standalone Auth Page (`/auth/[...path]`)
```tsx
// app/(auth)/auth/[...path]/page.tsx
"use client";

import { Auth, AuthLayout, AuthLegalNotice } from "theoui/auth";
import { useParams } from "next/navigation";

export default function AuthCatchAllPage() {
  const params = useParams();
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path;

  return (
    <AuthLayout>
      <Auth path={path} />
      <AuthLegalNotice />
    </AuthLayout>
  );
}
```

### User Navigation Button (`UserButton` & `UserAvatar`)
```tsx
import { UserButton, UserAvatar } from "theoui/auth";

export function HeaderNav() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <span className="font-semibold">App</span>
      <UserButton />
    </header>
  );
}
```

### Settings Catch-All View (`/settings/[...path]`)
Server Component pages can safely render the client `<Settings />` view:
```tsx
// app/(dashboard)/settings/[...path]/page.tsx
import { Settings } from "theoui/auth";

export default async function SettingsCatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const resolvedPath = path?.join("/") ?? "account";

  return <Settings path={resolvedPath} />;
}
```

### Organization Workspace Catch-All (`/organization/[...path]`)
```tsx
// app/(dashboard)/organization/[...path]/page.tsx
import { Organization } from "theoui/auth";

export default async function OrganizationCatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const resolvedPath = path?.[path.length - 1] ?? "settings";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Organization path={resolvedPath} />
    </div>
  );
}
```

### Admin User Management View
```tsx
// app/(dashboard)/admin/users/page.tsx
"use client";

import { AdminUsers } from "theoui/auth";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">User Management</h1>
      <AdminUsers />
    </div>
  );
}
```

---

## 3. Client Auth Hooks

Always import auth hooks from `"theoui/auth"`:

```tsx
"use client";

import { useSession, useActiveOrganization, useAuth } from "theoui/auth";
import { authClient } from "@/lib/auth-client";

export function UserGreeting() {
  const { data: session } = useSession(authClient);
  const { data: org } = useActiveOrganization(authClient);

  if (!session?.user) return null;

  return <div>Hello, {session.user.name} ({org?.name ?? "Personal"})</div>;
}
```

---

## Anti-Patterns

- **❌ Importing plugins from `"theoui/auth"`**: Plugins belong in `"theoui/auth/lib"`.
- **❌ Importing from `"theoui/auth/plugins"`**: The subpath is `"theoui/auth/lib"`.
- **❌ Invoking `createContext` manually**: Auth state is managed via `AuthProvider` and standard hooks.
