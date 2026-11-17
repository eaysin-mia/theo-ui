# @theo/ui

Private React UI components for React 19 applications.

## Install

Authenticate with the private npm registry, then install the package:

```sh
pnpm add @theo/ui
```

The package requires React and React DOM 19. Add optional feature dependencies
only when using components that need them; all other peer dependencies are
marked optional and are not needed by every consumer. For example, an app using
the auth, form, query, and toast integrations can install:

```sh
pnpm add @better-auth-ui/core @better-auth-ui/react better-auth \
  @daypicker/react date-fns @tanstack/react-form @tanstack/react-query sonner
```

For other integrations, install the optional peer dependencies used by the
specific components you import. The complete supported peer dependency list is
in this package's `peerDependencies` in `package.json`.

## Styles

Import the generated stylesheet once from your application's root:

```tsx
import "@theo/ui/globals.css";
```

This stylesheet includes the package's Tailwind CSS utilities, theme tokens,
Inter Variable font, and global base styles. It uses a neutral light/dark theme;
override the CSS variables in your application after importing it to customize
the theme.

## Imports

The root exports the general-purpose components that do not require optional
feature peers. Use it for common components:

```tsx
import { AlertDialog, Button, Dialog, Input, Select } from "@theo/ui";
import { AuthLayout, SignIn } from "@theo/ui/auth";
import { AppSidebar } from "@theo/ui/app-layout";
```

Components that require optional peers remain available by subpath, for
example `@theo/ui/calendar`, `@theo/ui/chart`, and
`@theo/ui/kanban`. Feature entry points include
`@theo/ui/event-calendar`, `/filters`, `/gantt`, `/qr-code`,
`/hooks/*`, and `/auth/plugins/*`. Individual auth components can be imported
from their auth feature paths, such as
`@theo/ui/auth/agent-auth/agent-authorizations`.

Use the documented package entry points rather than importing from
`/components/*` or `/lib/*`; those implementation paths are not part of the
public API. Keep application-specific routing, auth client setup, and demo
compositions in the consuming app, and pass app-specific behavior into shared
components through props or render slots.

## Development

Build JavaScript, declarations, and the standalone stylesheet with:

```sh
pnpm --filter @theo/ui build
```

`prepack` runs this build automatically when creating a package tarball or
publishing, so the generated `dist` files are included.

## Releases

Follow Semantic Versioning when updating `version` in `package.json`: patch for
backwards-compatible fixes, minor for backwards-compatible features, and major
for breaking API changes. Validate the package and consuming app before
publishing. After authenticating to npm, publish the restricted package with:

```sh
pnpm --filter @theo/ui publish --access restricted
```
