# Spec Delta

## Purpose

Defines the Turborepo monorepo configuration, task pipelines, workspace dependency graph, and local package linking between `apps/web` and `@theo/ui`.

## ADDED Requirements

### Requirement: Turborepo Task Pipelines and Caching

The repository root SHALL define a `turbo.json` file configuring task execution dependencies, cached file outputs, and environment variables across workspace applications and packages.

#### Scenario: Running build task across workspaces
- **WHEN** a developer executes `pnpm build` or `turbo build` from the monorepo root
- **THEN** Turbo builds `@theo/ui` first before building `apps/web` based on `^build` task dependencies, caching build outputs in `dist/**` and `.next/**`

#### Scenario: Re-executing cached builds
- **WHEN** `pnpm build` is executed with unchanged source files
- **THEN** Turbo replays previously cached outputs without recompiling packages

### Requirement: Workspace Protocol Linking

Applications within the monorepo SHALL declare workspace package dependencies using the pnpm `workspace:*` protocol to ensure live resolution against local source packages.

#### Scenario: Playground consumer importing local UI package
- **WHEN** `apps/web` declares `"@theo/ui": "workspace:*"` in its `package.json`
- **THEN** the playground application consumes the local `@theo/ui` package and re-renders upon package changes during development

### Requirement: Artifact-First Live Development Loop

The development orchestration SHALL execute package compilation in watch mode (`tsc --watch`) so that consumer applications develop against the exact compiled `dist/` artifacts intended for publishing.

#### Scenario: Real-time playground updates from compiled artifacts
- **WHEN** a developer edits a component in `packages/ui/src/` during `pnpm dev`
- **THEN** `tsc --watch` recompiles the changed file into `packages/ui/dist/` and `apps/web` reloads via Next.js Fast Refresh

### Requirement: Independent Package Verification

Every package and application in the monorepo SHALL expose independent npm scripts for building, linting, formatting, and typechecking.

#### Scenario: Filtering tasks to the UI package
- **WHEN** a developer executes `pnpm --filter @theo/ui typecheck`
- **THEN** TypeScript validation runs strictly on the `@theo/ui` package without invoking typechecks across unrelated monorepo apps
