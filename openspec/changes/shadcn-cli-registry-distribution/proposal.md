# Proposal: shadcn-Compatible Registry and CLI Distribution

## Why

Currently, `theoui` is packaged and distributed strictly as a monolithic/multi-subpath npm library (`theoui` v0.3.0). While effective for standard package consumption, modern open-source UI ecosystems (such as coss UI, Magic UI, Better Auth UI, Kokonut UI, and Cult UI) provide source-level code ownership through the `shadcn` CLI registry standard (`npx shadcn@latest add <component>`).

Adopting the shadcn-compatible registry architecture allows developers to:
1. Copy-paste and install only the exact components and hooks they need directly into their project's `@/components/ui/` directory.
2. Maintain complete ownership to edit, customize, and refactor component code without fighting package abstractions.
3. Automatically resolve and install transitive npm dependencies (e.g. `@base-ui/react`, `lucide-react`, `motion`, `date-fns`) and peer dependencies.
4. Seamlessly integrate `theoui` components alongside existing shadcn/ui and coss UI components via standard `components.json` registry endpoints (`@theoui`).

## What Changes

- **Registry Build Pipeline (`registry:build`)**: Implement an automated compilation pipeline that scans `packages/ui` source files (`components/`, `auth/`, `hooks/`, `lib/`, `styles/`) and compiles compliant shadcn registry items into JSON manifests (`registry.json` index and per-item `r/{name}.json` / `r/{style}/{name}.json`).
- **Standardized Registry Schema**: Align all generated registry items with the official `https://ui.shadcn.com/schema/registry-item.json` specification, detailing:
  - `name`, `type` (`registry:ui`, `registry:hook`, `registry:lib`, `registry:block`, `registry:style`)
  - `dependencies`: Automated detection and extraction of external npm runtime dependencies (e.g., `@base-ui/react`, `lucide-react`, `motion`).
  - `devDependencies`: Development-only packages.
  - `registryDependencies`: Inter-component dependencies (e.g. `dialog` requiring `button`, or `event-calendar` requiring `calendar`, `popover`, `select`).
  - `files`: File definitions with relative paths, target locations, and full file contents.
  - `tailwind`: CSS variables and utility classes required by the component.
- **Registry Endpoint Hosting in `apps/web`**: Expose the generated registry artifacts under `apps/web/public/r/` (or via dynamic route handlers) so that `npx shadcn@latest add http://<host>/r/<component>.json` or `npx shadcn@latest add @theoui/<component>` can fetch them remotely.
- **`components.json` Registry Definition**: Provide official configuration for consumer `components.json` registering `"@theoui": "https://theoui.dev/r/{name}.json"` alongside existing registries (`@coss`, `@better-auth-ui`).
- **Dual Distribution Preservation**: Keep the compiled npm package (`theoui`) fully intact and functional while adding CLI registry publishing as a complementary distribution tier.

## Capabilities

### New Capabilities
- `shadcn-cli-registry-distribution`: Defines the shadcn-compatible registry schema generation, per-item JSON compilation (`registry.json`, `r/{name}.json`), transitive dependency resolution, inter-component registry dependency graphs, and CLI consumption contracts.

### Modified Capabilities
- `component-library-packaging`: Extends the packaging lifecycle from npm-only ESM compilation to dual-distribution (ESM npm library + static/dynamic shadcn registry artifacts).

## Impact

- **`packages/ui`**: Adds a registry manifest configuration (e.g. `registry.ts` or registry build script), script entry `pnpm build:registry`, and metadata definitions for all 60+ UI components, hooks, auth views, and composite widgets.
- **`apps/web`**: Hosts the generated registry endpoints in `public/r/` or `/api/r/[name]` for live testing and external CLI downloads.
- **Consumers**: Can run `npx shadcn@latest add @theoui/button` or `npx shadcn@latest add http://localhost:3000/r/button.json` to pull components directly into their local codebase.
