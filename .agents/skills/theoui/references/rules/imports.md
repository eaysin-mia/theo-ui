# Import Rules (theoui)

Use this guide when generating or refactoring imports of `theoui` in applications and packages.

## Public Subpaths Map

`theoui` exposes only 5 clean, distinct public subpaths. Never import from internal directories (`theoui/components/...`, `theoui/utils`, `theoui/auth/plugins`).

### 1. General UI Components: `"theoui"`
All base components, buttons, icons, frames, and composite layouts are exported directly from the package root:
```tsx
import {
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
  Badge,
  Dialog,
  DialogTrigger,
  DialogPopup,
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  ToastProvider,
  AnchoredToastProvider,
  Gantt,
  Kanban,
  KanbanBoard,
  CodeBlock,
  CodeBlockContent,
  Trace,
} from "theoui";
```

### 2. Authentication Views & Forms: `"theoui/auth"`
All interactive authentication views, forms, dialogs, user buttons, and client hooks:
```tsx
import {
  Auth,
  SignIn,
  SignUp,
  SignOut,
  UserButton,
  UserAvatar,
  Settings,
  SettingsDirectory,
  Organization,
  AdminUsers,
  useSession,
  useAuth,
  useActiveOrganization,
} from "theoui/auth";
```

### 3. Auth Plugins & Client Adapters: `"theoui/auth/lib"`
All Better-Auth plugin extensions and client configuration adapters:
```tsx
import {
  adminPlugin,
  organizationPlugin,
  twoFactorPlugin,
  passkeyPlugin,
  apiKeyPlugin,
  ssoPlugin,
  magicLinkPlugin,
} from "theoui/auth/lib";
```

### 4. Reusable Hooks: `"theoui/hooks"`
Custom React hooks with zero auth dependencies:
```tsx
import {
  useMediaQuery,
  useAutoHeight,
  useIsHydrated,
  useComposerEditor,
} from "theoui/hooks";
```

### 5. General Utilities: `"theoui/lib"`
Class merge utilities and document helpers:
```tsx
import { cn } from "theoui/lib";
```

---

## Anti-Patterns to Strictly Prohibit

```tsx
// ❌ WRONG: Do NOT import from internal component paths
import { Button } from "theoui/components/button";
import { Card } from "theoui/components/card";

// ❌ WRONG: Do NOT import from theoui/utils
import { cn } from "theoui/utils";

// ❌ WRONG: Do NOT import auth plugins from theoui/auth/plugins
import { adminPlugin } from "theoui/auth/plugins";

// ❌ WRONG: Do NOT import auth components from root
import { SignIn } from "theoui";

// ✅ CORRECT: Use the exact designated subpaths
import { Button, Card } from "theoui";
import { cn } from "theoui/lib";
import { SignIn } from "theoui/auth";
import { adminPlugin } from "theoui/auth/lib";
```
