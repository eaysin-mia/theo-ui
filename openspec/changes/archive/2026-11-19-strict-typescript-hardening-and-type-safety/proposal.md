# Proposal

## Why

While `@theo/ui` compiles and typechecks with zero errors, an architectural audit revealed that previous attempts to replace `any` in React context singletons with `unknown` introduced an anti-pattern: widespread nested type assertions (`as unknown as TargetType`). Because React Context is a runtime singleton and generic interfaces with callbacks are invariant in TypeScript, forcing `<unknown>` onto context singletons created zero-overlap type mismatches (TS2352) that developers bypassed with `as unknown as`. Furthermore, dynamic property access on strict interfaces was bypassed using `(obj as unknown as Record<string, unknown>)[key]`.

To establish `@theo/ui` as a robust, enterprise-grade, production UI component library, we must address the root causes: adopt the canonical industry architecture for generic React contexts (type-erased transport carrier with strictly typed public generic APIs), eliminate all `as unknown as` double-casts, use standard reflection for dynamic object indexing, and harden monorepo TypeScript configurations.

## What Changes

- **Root-Cause Architectural Resolution for Generic Contexts**:
  - Re-architect internal context singletons (`TreeContext`, `GanttInstance`, `GanttBarContextValue`, `FilterStateContextValue`, `KanbanContext`) as type-erased transport carriers.
  - Eliminate all `as unknown as` double-assertions at Provider values and Hook returns.
  - Expose 100% strictly typed public generic component and hook signatures (`<Tree<T>>`, `useTreeContext<T>`, `<Gantt<TData>>`, `useGantt<TData>`).
- **Eliminate Double-Casting on Object Properties**:
  - Replace `(obj as unknown as Record<string, unknown>)[key]` in auth and pattern components with `Reflect.get(obj, key)` or safe property guards.
- **Strict TypeScript Compiler Configurations**:
  - Maintain `noImplicitOverride: true` and `noUncheckedIndexedAccess: true` in `@workspace/typescript-config`.
- **Comprehensive Component Prop Types & Polymorphic Contracts**:
  - Ensure all primitives expose clear, accessible prop interfaces extending `useRender.ComponentProps<T>` or `React.ComponentPropsWithRef<T>`.
  - Validate that all compound components (`Dialog`, `Menu`, `Select`, `Tabs`, `Drawer`, `Accordion`) export their slot prop types.

## Capabilities

### New Capabilities
- `typescript-type-safety-and-contracts`: Defines strict TypeScript standards, zero double-casting (`as unknown as`) enforcement, generic context transport architecture, and comprehensive component prop type exports across `@theo/ui`.

### Modified Capabilities
- `component-library-packaging`: Enforce strict type declaration emission and compiler options (`noImplicitOverride`, `noUncheckedIndexedAccess`) in the package's build pipeline.

## Impact

- **Affected Code**: `packages/ui/src/patterns/tree.tsx`, `packages/ui/src/patterns/gantt/`, `packages/ui/src/patterns/filters/`, `packages/ui/src/patterns/kanban.tsx`, `packages/ui/src/components/auth/`, and compiler configurations.
- **APIs & Types**: Clean generic signatures provide 100% type safety, autocompletion, and zero double-casts without breaking consumer code.
- **Dependencies**: Zero new runtime dependencies.
