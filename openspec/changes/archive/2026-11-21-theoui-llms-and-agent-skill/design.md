# Design

## Context

See proposal.md for motivation. `theoui` is built on Base UI, Better Auth, and Tailwind CSS v4, with distinct subpaths: `"theoui"`, `"theoui/auth"`, `"theoui/auth/lib"`, `"theoui/hooks"`, and `"theoui/lib"`. Standard primitives are already documented under `.agents/skills/coss/`. Duplicating them inside `theoui` causes bloat. Instead, `theoui` adopts a layered architecture: delegating standard primitives to `coss` and pattern blocks to `coss-particles`, while focusing deeply on `theoui`'s unique capabilities (Better Auth, utilities, and complex components like Gantt, Kanban, EventCalendar, Filters, Composer, Chat, and AutoHeight).

## Goals / Non-Goals

**Goals:**
- Author `.agents/skills/theoui/SKILL.md` with modular guides:
  - `references/rules/imports.md`: 5 public subpaths and RSC boundaries.
  - `references/rules/auth.md`: Better Auth forms, views, client hooks, and 28 plugins.
  - `references/rules/advanced-components.md`: Gantt, Kanban, EventCalendar, Filters, Composer, Chat, AutoHeight, and micro-buttons.
  - `references/rules/lib.md`: Utilities (`cn`, highlighter, composer query).
- Cross-reference `.agents/skills/coss/` for standard primitives (Button, Dialog, Select, etc.).
- Cross-reference `.agents/skills/coss-particles/` and `https://coss.com/ui/particles` for composed block patterns.
- Deliver `apps/web/public/llms.txt` and `apps/web/public/llms-full.txt` aligned with this layered structure.

**Non-Goals:**
- Duplicating 50+ primitive markdown files inside `theoui`.
- Changing component runtime code or public exports.

## Decisions

### 1. 3-Tier Layered Skill Architecture
- **Tier 1 (Base Primitives)**: Handled by `.agents/skills/coss/`.
- **Tier 2 (Composed Particles)**: Handled by `.agents/skills/coss-particles/`.
- **Tier 3 (Domain Framework & Complex Widgets)**: Handled by `.agents/skills/theoui/` (Auth, Gantt, Kanban, EventCalendar, Filters, Composer, Chat, RSC rules).

### 2. Dedicated Auth Guide (`references/rules/auth.md`)
- Provide copy-paste recipes for `SignIn`, `SignUp`, `Settings`, `Organization`, `AdminUsers`, and `useSession`.
- Detail plugin configuration (`adminPlugin`, `organizationPlugin`, `twoFactorPlugin`) via `"theoui/auth/lib"`.
- Clarify RSC boundary rules (Server page with client component import).

### 3. Dedicated Advanced Components Guide (`references/rules/advanced-components.md`)
- Detail props and part hierarchy for:
  - `Gantt` (`GanttNav`, `GanttToolbar`, `GanttView`, `GanttEvent`, `GanttSlotDraft`)
  - `Kanban` (`KanbanBoard`, `KanbanColumn`, `KanbanItem`, `KanbanOverlay`)
  - `EventCalendar` (`EventCalendarMonthView`, `EventCalendarAgendaView`, etc.)
  - `Filters` (`FiltersBuilder`, `FiltersChip`, date operators)
  - `Composer` (`ComposerInput`, `ComposerList`, `ComposerPopup`, `getComposerText`)
  - `Chat Feed` (`MessageScroller`, `Message`, `Bubble`, `Attachment`, `Trace`)
  - `AutoHeight`

## Risks / Trade-offs

- **[Risk]** Agent unaware of where to look for basic button/dialog details → **Mitigation**: Prominent "Primitives Delegation" section in `SKILL.md` pointing directly to `coss`.
- **[Risk]** Hallucinating old `@coss/*` package imports → **Mitigation**: Reiterate that all components are imported from `"theoui"`.
