# Contributing to theoui

Thank you for your interest in contributing to theoui! This project is an accessible, unstyled-first React 19 UI component library built with Base UI and Tailwind CSS v4.

---

## 1. Development Setup

### Prerequisites

- **Node.js**: >= 20.9.0 (Node 22 LTS recommended)
- **pnpm**: v12.18.0 or newer

### Getting Started

```bash
# Clone the repository
git clone https://github.com/eaysin-mia/theoui.git
cd theoui

# Install dependencies across the workspace
pnpm install

# Start development in watch mode
pnpm dev
```

---

## 2. Project Architecture

This repository is structured as a Turborepo monorepo:

- **`packages/ui`**: The publishable component library (`theoui`). Contains primitives in `src/components/`, compositions in `src/patterns/`, and tests in `tests/`.
- **`apps/web`**: Interactive playground and documentation demo application built with Next.js 16.

---

## 3. Component Design & Patterns

When adding or updating components:

1. **Base UI Primitives**: Base UI (`@base-ui/react`) is used for unstyled, accessible behavioral logic.
2. **Polymorphic Rendering**: Use the `useRender` hook and `render` prop delegation for custom elements.
3. **Styling**: Styles use Tailwind CSS v4 and `class-variance-authority` (cva).
4. **Testing**: Write unit tests in `packages/ui/tests/` matching component behavior. Run tests using `pnpm test`.

---

## 4. Verification Workflow

Before submitting a Pull Request, verify that all checks pass:

```bash
# 1. Format verification
pnpm format:check

# 2. Linting
pnpm lint

# 3. Type checking
pnpm typecheck

# 4. Automated unit tests
pnpm test

# 5. Full workspace build
pnpm build
```

---

## 5. Submitting Changes

1. Create a descriptive branch: `git checkout -b feat/your-feature-name`.
2. Commit your changes following conventional commit syntax.
3. If your change affects the published `theoui` package, create a changeset:
   ```bash
   pnpm changeset
   ```
4. Push to your fork and submit a Pull Request against `main`.
