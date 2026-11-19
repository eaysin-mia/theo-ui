# Design

## Context

See `proposal.md` for background and motivation. The `@theo/ui` package currently compiles, but an architectural audit revealed a critical anti-pattern:
1. Widespread nested type assertions (`as unknown as TargetType`) introduced when attempting to parameterize invariant React Context singletons with `unknown`.
2. Dynamic object indexing on strict interfaces bypassing TypeScript safety via `(obj as unknown as Record<string, unknown>)[key]`.
3. Flawed assumption that replacing `<any>` with `<unknown>` in module-level React Context singletons produces type safety. In reality, because callbacks make generic instances invariant under `--strictFunctionTypes`, `Context<unknown>` has zero overlap with `Context<TData>`, triggering TS2352 and forcing developers to use `as unknown as` double-casting.

## Goals / Non-Goals

**Goals:**
- Completely eliminate all nested type assertions (`as unknown as ...`) across `@theo/ui`.
- Implement the canonical TypeScript architecture for generic React contexts: internal type-erased transport carrier with 100% strictly typed public generic APIs (`<Component<TData>>` and `useComponent<TData>()`).
- Replace dynamic property double-casting (`(obj as unknown as Record<string, unknown>)[key]`) with standard `Reflect.get()` or property-guard helpers.
- Keep `noImplicitOverride: true` and `noUncheckedIndexedAccess: true` in base compiler configurations.
- Ensure all compound components export their slot prop interfaces consistently.

**Non-Goals:**
- Rewriting runtime logic of complex pattern algorithms (`gantt-lib`, `filters-lib`).
- Adding external runtime validation libraries (such as Zod or Valibot) — all improvements are compile-time TypeScript contracts and standard JavaScript reflection.

## Decisions

### Decision 1: Internal Type-Erased Context Transport with Strict Public Generic Contracts
- **Root Cause**: React Context (`createContext`) is evaluated once at module load time as a runtime singleton. It cannot hold generic type parameters chosen dynamically by callers at render time. Furthermore, complex instances (`GanttInstance<TData>`, `TreeInstance<T>`, `FilterStateContextValue<V>`) contain both input callbacks (contravariant) and output getters (covariant), rendering them **invariant**. Defining `createContext<Instance<unknown> | null>(null)` makes it impossible to assign `Instance<TData>` into the Provider, and impossible to extract `Instance<TData>` in the hook without TypeScript rejecting it (TS2352), which previously caused developers to write `as unknown as ...`.
- **Choice**:
  1. Keep the internal, unexported React Context definition type-erased using `any` at the singleton boundary (`createContext<Instance<any> | null>(null)`).
  2. Maintain strictly-typed public generic contracts for `<Component<TData>>` (accepting `Instance<TData>`) and `useComponent<TData>()` (returning `Instance<TData>`).
  3. The Provider assigns directly without assertions: `<Context.Provider value={instance}>` (since `Instance<TData>` is assignable to `Instance<any>`).
  4. The Hook returns `instance as Instance<TData>` via a single, direct, standard type assertion (or inferred directly).
- **Rationale**: This is the industry-standard architecture used by TanStack Table, Radix UI, and React Aria. It eliminates every single `as unknown as` double-cast across providers and hooks while ensuring consumers enjoy complete type safety and autocompletion.

### Decision 2: Zero Double-Casting Policy & Safe Dynamic Property Lookup
- **Root Cause**: Components like `admin-users.tsx`, `organization-invitation-row.tsx`, and `organization-member-row.tsx` index into strict interfaces (`User`, `Invitation`, `Member`) using dynamic field names from plugins (`field.name`), using `(invitation as unknown as Record<string, unknown>)[field.name]`.
- **Choice**: Use standard `Reflect.get(target, key)` or a typed helper:
  ```ts
  function getCustomField(target: object, key: string): unknown {
    return Reflect.get(target, key);
  }
  ```
- **Rationale**: Eliminates double-casting entirely, relies on standard ECMAScript reflection, and preserves type safety by returning `unknown`.

### Decision 3: Refactor `(internal as any)[key] = value` in Gantt State
- **Choice**: In `packages/ui/src/patterns/gantt/gantt.tsx`, use a typed switch-case setter or keyof mapping instead of `(internal as any)[key] = value`.
- **Rationale**: Eliminates unsafe mutation and guarantees compile-time exhaustiveness.

### Decision 4: Standardize Base UI Component Prop Interfaces
- **Choice**: Standardize all primitive component prop types on `useRender.ComponentProps<T>`:
  ```ts
  export interface ButtonProps extends useRender.ComponentProps<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
  ```
- **Rationale**: Guarantees that `render` prop polymorphism (`render={<Link href="..." />}`) is strongly typed, auto-completes, and passes ref types correctly.

## Risks / Trade-offs

- **[Risk] Strict ESLint Rule against `any`**: If an ESLint rule flags `any` at the internal context creation line.
  - *Mitigation*: The `any` is strictly confined to unexported module-private `createContext` declarations with an explanatory comment, ensuring zero `any` leaks into public types or consumer code.
- **[Risk] Consumer Data Narrowing**: Consumers of `useTreeContext` or `useGantt` must specify `<MyData>` if they want typed custom fields.
  - *Mitigation*: Default to `unknown` on public hook generic parameters (`useGantt<TData = unknown>()`), ensuring type safety by forcing consumer narrowing when accessing payload fields.
