# Tasks: shadcn-Compatible Registry and CLI Distribution

## 1. Registry Schema & Manifest Definitions

- [ ] 1.1 Create TypeScript registry schema types (`packages/ui/scripts/registry-types.ts`) adhering to the official shadcn registry schema (`https://ui.shadcn.com/schema/registry-item.json`) and verify with `pnpm --filter theoui typecheck`.
- [ ] 1.2 Define the master component inventory manifest (`packages/ui/scripts/registry-manifest.ts`) mapping all 60+ primitives, hooks, auth views, and composite blocks to their categorization, title, and file pointers.

## 2. Registry Build Pipeline & AST Analysis

- [ ] 2.1 Implement the registry compiler (`packages/ui/scripts/build-registry.ts`) with AST parsing to extract npm runtime `dependencies`, intra-library `registryDependencies`, and transform monorepo internal aliases (`#lib/*`, `#components/*`) into consumer-ready aliases (`@/lib/*`, `@/components/ui/*`).
- [ ] 2.2 Wire `build:registry` in `packages/ui/package.json` and declare pipeline dependencies in root `turbo.json`.
- [ ] 2.3 Execute `pnpm --filter theoui build:registry` and verify that `registry.json` index and per-component `r/{name}.json` files are generated in `apps/web/public/r/`.

## 3. Remote Distribution & CLI Validation

- [ ] 3.1 Validate emitted JSON artifacts against the shadcn registry schema using `zod` validation tests in `packages/ui/tests/registry.test.ts`.
- [ ] 3.2 Verify static file delivery from `apps/web/public/r/` by starting the development server and fetching `http://localhost:3000/r/button.json` and `http://localhost:3000/r/dialog.json`.
- [ ] 3.3 Execute dry-run component installation with the shadcn CLI (`pnpm dlx shadcn@latest add http://localhost:3000/r/button.json --dry-run`) to verify file placement and dependency resolution.

## 4. Documentation & Agent Guidance

- [ ] 4.1 Update `packages/ui/README.md` to document both npm installation (`pnpm add theoui`) and CLI registry installation (`pnpm dlx shadcn@latest add @theoui/<component>`).
- [ ] 4.2 Update `.agents/skills/theoui/SKILL.md` to document the CLI registry installation workflow and `components.json` registry setup.
