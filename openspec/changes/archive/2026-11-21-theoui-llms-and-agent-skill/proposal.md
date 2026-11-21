# Proposal

## Why

AI coding agents and LLMs frequently generate outdated code, hallucinated subpath imports (like `theoui/components/...` or `theoui/utils`), or obsolete Radix `asChild` composition when working with `theoui`. To ensure LLMs produce accurate, idiomatic, accessible, and high-performance code, `theoui` needs an authoritative agent skill (`.agents/skills/theoui/SKILL.md`) and standard LLM text documentation (`llms.txt` and `llms-full.txt`).

Rather than duplicating 50+ basic Base UI primitives already documented in the repository's `coss` skill, `theoui` documentation will delegate standard primitives to `coss` and pattern blocks to `coss-particles`, while focusing exclusively on what makes `theoui` unique:
1. Strict 5-subpath export architecture and RSC boundaries
2. Full Better Auth UI system (`theoui/auth` and `theoui/auth/lib`)
3. General utilities (`theoui/lib`)
4. Advanced domain components not present in `coss` (Gantt, Kanban, EventCalendar, Filters, Composer, Chat Feed, AutoHeight, and micro-interaction buttons)

## What Changes

- Author an authoritative LLM agent skill (`.agents/skills/theoui/SKILL.md`) with dedicated guides for:
  - Better Auth forms, views, client hooks, and 28 plugins (`theoui/auth` & `theoui/auth/lib`).
  - Advanced domain components exclusive to `theoui` (`Gantt`, `Kanban`, `EventCalendar`, `Filters`, `Composer`, `Chat`, `AutoHeight`, and interactive buttons).
  - General utilities (`theoui/lib`).
  - Strict subpath import rules and RSC boundaries.
- Delegate standard primitive lookup to `.agents/skills/coss/` to eliminate documentation redundancy.
- Direct agents to `.agents/skills/coss-particles/` and `https://coss.com/ui/particles` for composed particle patterns.
- Generate web-accessible LLM context files (`apps/web/public/llms.txt` and `apps/web/public/llms-full.txt`) adhering to this modular architecture.

## Capabilities

### New Capabilities
- `llm-agent-skill-and-documentation`: Defines the requirements, schema, and content structure for LLM text files (`llms.txt`, `llms-full.txt`) and repository agent skills (`.agents/skills/theoui/SKILL.md`) that guide AI assistants in generating valid `theoui` implementations, delegating to `coss` and `coss-particles` where appropriate.

### Modified Capabilities
- `coss-component-composition-patterns`: Update requirements to reflect the rebranded `theoui` library name, strict public export subpaths, and Base UI `render` prop invariants.

## Impact

- Agent Tooling: Adds `.agents/skills/theoui/` with zero primitive duplication.
- Developer Experience: AI coding agents will generate idiomatic `theoui` imports, auth implementations, and advanced component setups without hallucination.
- Web Delivery: Static delivery of `llms.txt` and `llms-full.txt` via `apps/web/public/`.
