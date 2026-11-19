# Tasks

## 1. Compiler Configuration Hardening

- [x] 1.1 Verify `noImplicitOverride: true` and `noUncheckedIndexedAccess: true` in `packages/typescript-config/base.json`.
- [x] 1.2 Verify compiler settings and path aliases in `packages/ui/tsconfig.json` and `packages/ui/tsconfig.build.json` for full declaration map emission.

## 2. Root-Cause Generic Context Re-Architecture (Eliminate Double Casts)

- [x] 2.1 Refactor `TreeContext` in `packages/ui/src/patterns/tree.tsx` to internal type-erased transport, eliminating `tree as unknown as TreeInstance<unknown>`, `currentItem: item as unknown as ItemInstance<unknown>`, and `useTreeContext` double-casts.
- [x] 2.2 Refactor `GanttContext`, `GanttViewConfigContext`, and `GanttBarContext` in `packages/ui/src/patterns/gantt/` to eliminate all `as unknown as` double-assertions at Provider values and Hook returns.
- [x] 2.3 Refactor `KanbanContext` in `packages/ui/src/patterns/kanban.tsx` to eliminate `as unknown as` double-casts in provider value and hook return.
- [x] 2.4 Refactor `FilterStateContext` in `packages/ui/src/patterns/filters/filters-context.tsx` to eliminate `as unknown as` double-casts in hook return.

## 3. Dynamic Property Lookup Refactoring (Eliminate Object Double Casts)

- [x] 3.1 Replace `(invitation as unknown as Record<string, unknown>)[field.name]` in `packages/ui/src/components/auth/organization/organization-invitation-row.tsx` with `Reflect.get()` or typed property helper.
- [x] 3.2 Replace `(member as unknown as Record<string, unknown>)[field.name]` in `packages/ui/src/components/auth/organization/organization-member-row.tsx` with `Reflect.get()` or typed property helper.
- [x] 3.3 Replace `user as unknown as Record<string, unknown>` in `packages/ui/src/components/auth/admin/admin-users.tsx` with a safe object type guard or `Reflect.get()`.
- [x] 3.4 Replace `viewConfigRef.current as unknown as Record<string, unknown>` shallow comparison in `packages/ui/src/patterns/gantt/gantt.tsx` with typed object shallow compare.

## 4. Verification & Monorepo Validation

- [x] 4.1 Run `grep -rn "as unknown as" packages/ui/src` and verify zero occurrences remain.
- [x] 4.2 Run `pnpm --filter @theo/ui typecheck` and verify clean compilation.
- [x] 4.3 Run `pnpm --filter web typecheck` and verify consumer application compiles cleanly.
- [x] 4.4 Run `pnpm --filter @theo/ui build` and verify declaration files (`.d.ts`) emit cleanly.
- [x] 4.5 Run `publint packages/ui --pack false` and verify package export contracts are valid.
