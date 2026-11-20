# Spec Delta

## Purpose

Provides machine-readable guidance, LLM prompts, agent skills, and full documentation files (`llms.txt`, `llms-full.txt`, and `SKILL.md`) so that AI coding agents generate compliant `theoui` component code, delegating to `coss` for primitives and `coss-particles` for composed blocks.

## ADDED Requirements

### Requirement: Standard LLM Summary File (llms.txt)
The web application SHALL serve a concise, machine-readable `llms.txt` at the root public directory summarizing library purpose, subpath exports, installation instructions, key architectural rules, and pointers to `coss` and `coss-particles`.

#### Scenario: Agent requests llms.txt
- **WHEN** an AI agent fetches `/llms.txt`
- **THEN** the system returns an H1 title, blockquote description, and categorized markdown link index mapping to subpaths, auth, advanced components, and external pattern libraries

### Requirement: Comprehensive LLM Context File (llms-full.txt)
The web application SHALL serve a complete `llms-full.txt` containing full component recipes for exclusive `theoui` features (Auth, Gantt, Kanban, EventCalendar, Filters, Composer, Chat Feed, AutoHeight), subpath exports mapping, and Base UI `render` prop rules.

#### Scenario: Agent requests full LLM training context
- **WHEN** an AI agent fetches `/llms-full.txt`
- **THEN** the system returns comprehensive documentation with exact import snippets, token definitions, auth setups, and advanced component APIs

### Requirement: Repository Agent Skill Definition
The repository SHALL provide a dedicated agent skill at `.agents/skills/theoui/SKILL.md` specifying library invariants, strict import rules, Base UI composition patterns, auth system guidance, and advanced component recipes, delegating standard primitives to `.agents/skills/coss/`.

#### Scenario: Agent loads theoui skill
- **WHEN** an agent activates `.agents/skills/theoui/SKILL.md`
- **THEN** the agent obtains rules for `theoui`'s 5 subpaths, references for Auth, Lib, and Advanced Components, and guidance to consult `coss` for primitives and `coss-particles` for UI patterns

### Requirement: Better Auth UI System Guidance
The agent skill and LLM text SHALL provide comprehensive documentation for Better Auth forms (`SignIn`, `SignUp`), views (`Settings`, `Organization`, `AdminUsers`), client hooks (`useSession`), and plugin configuration via `"theoui/auth/lib"`.

#### Scenario: Agent implements authentication UI
- **WHEN** an agent is tasked with building authentication screens
- **THEN** the agent uses `"theoui/auth"` for views and `"theoui/auth/lib"` for plugins, adhering to the client boundary contract

### Requirement: Advanced Components Specification
The agent skill and LLM text SHALL specify APIs, props, and composition structures for components exclusive to `theoui` (`Gantt`, `Kanban`, `EventCalendar`, `Filters`, `Composer`, `Chat Feed`, `AutoHeight`, and interactive micro-buttons).

#### Scenario: Agent implements project management UI
- **WHEN** an agent builds a task board or project timeline
- **THEN** the agent imports `Kanban` or `Gantt` directly from `"theoui"` with proper part hierarchy and state bindings
