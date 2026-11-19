# Spec Delta

## Purpose

Enforces strict TypeScript type contracts, zero double-casting (`as unknown as T`) policy, comprehensive polymorphic component prop interfaces, and architecturally sound generic context parameterization across all UI components and patterns.

## ADDED Requirements

### Requirement: Forbidden Double Type Assertions Policy

The codebase SHALL strictly forbid double type assertions (`as unknown as TargetType` or `as any as TargetType`) and `@ts-ignore` / `@ts-expect-error` directives, requiring type-safe variance handling, single assertions, generic boundaries, or runtime guards instead.

#### Scenario: Compiling with zero double-casting
- **WHEN** TypeScript compilation executes on `@theo/ui`
- **THEN** zero files contain `as unknown as` or `as any as` type assertions

#### Scenario: Dynamic object property access
- **WHEN** accessing dynamic plugin fields on strict data interfaces without index signatures
- **THEN** properties are accessed via `Reflect.get()` or type-guard helpers returning `unknown`, rather than casting the object to `Record<string, unknown>` through `unknown`

### Requirement: Generic React Context Architecture

Compound component patterns SHALL define internal unexported React Context transport carriers without forcing invariance contradictions on generic parameters, ensuring that:
1. Public components (`<Component<TData>>`) accept strictly typed props with zero type assertions at `<Context.Provider value={instance}>`.
2. Public hooks (`useComponent<TData = unknown>()`) return strictly typed instances without double-casting.

#### Scenario: Generic React Context instantiation
- **WHEN** compound component contexts (e.g. `TreeContext`, `GanttInstance`, `FilterStateContextValue`, `KanbanContext`) are defined
- **THEN** internal context transport channels do not reject typed provider values, eliminating all `as unknown as` assertions

### Requirement: Strict Index Access Safety

The TypeScript configuration SHALL enforce `noImplicitOverride: true` and `noUncheckedIndexedAccess: true`, ensuring all indexed access lookups handle potential `undefined` states.

#### Scenario: Accessing indexed array or record elements
- **WHEN** accessing an element by dynamic key or numeric index
- **THEN** TypeScript marks the returned value as potentially `undefined`

### Requirement: Polymorphic Component Prop Contracts

All UI primitive components SHALL export comprehensive TypeScript interfaces extending `useRender.ComponentProps<T>` or `React.ComponentPropsWithRef<T>`, ensuring consumers receive complete autocomplete and type safety for standard HTML attributes, Base UI `render` prop delegation, and custom component props.

#### Scenario: Consumer using render prop
- **WHEN** a consumer passes `render={<Link href="..." />}` to `Button` or `Card`
- **THEN** TypeScript validates the combined prop signatures without requiring type assertions
