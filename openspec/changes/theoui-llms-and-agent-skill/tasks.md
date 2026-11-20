# Tasks

## 1. Author Modular theoui Skill & Guides

- [x] 1.1 Remove duplicated primitive reference files from `.agents/skills/theoui/references/primitives/`.
- [x] 1.2 Update `.agents/skills/theoui/SKILL.md` with the 3-tier model: delegating primitives to `coss` and pattern blocks to `coss-particles`, with exclusive focus on `theoui` subpaths, auth, lib, and advanced components.
- [x] 1.3 Create `.agents/skills/theoui/references/rules/auth.md` detailing Better Auth views (`SignIn`, `SignUp`, `Settings`, `Organization`, `AdminUsers`), client hooks, and plugins via `"theoui/auth/lib"`.
- [x] 1.4 Create `.agents/skills/theoui/references/rules/advanced-components.md` detailing APIs, props, and composition for `Gantt`, `Kanban`, `EventCalendar`, `Filters`, `Composer`, `Chat`, `AutoHeight`, and interactive micro-buttons.
- [x] 1.5 Create `.agents/skills/theoui/references/rules/lib.md` detailing `theoui/lib` utilities (`cn`, highlighter, composer document/clipboard).

## 2. Generate Layered LLM Documentation

- [x] 2.1 Update `apps/web/public/llms.txt` reflecting the 5 subpaths, Better Auth UI, advanced components, and pointers to `coss` and `coss-particles`.
- [x] 2.2 Update `apps/web/public/llms-full.txt` with complete recipes for Auth, Gantt, Kanban, EventCalendar, Filters, Composer, Chat Feed, and utilities.

## 3. Verification & Validation

- [x] 3.1 Run `openspec validate theoui-llms-and-agent-skill` to confirm all artifacts conform to schema.
- [x] 3.2 Validate Next.js web build with `pnpm --filter web build` to ensure static delivery of `llms.txt` and `llms-full.txt`.
