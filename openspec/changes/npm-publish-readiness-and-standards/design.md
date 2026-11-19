# Design

## Context

See `proposal.md` for motivation. `@theo/ui` is an unbundled, ESM-first React 19 component library containing 70+ components and patterns built on Base UI and Tailwind CSS v4. 

To transition from an internal workspace package into a production-grade, public npm package that can be installed by any external developer via `pnpm add @theo/ui` or `npm install @theo/ui`, we must establish complete licensing, clean distribution manifests, automated registry publication with provenance, and pre-publish quality gates.

## Goals / Non-Goals

**Goals:**
- Provide official MIT `LICENSE` files at repo root and package root, ensuring unambiguous open-source rights.
- Ensure the npm distribution tarball includes `dist/`, `README.md`, `LICENSE`, and `THIRD_PARTY_LICENSES.md`.
- Configure `.github/workflows/release.yml` for the official public npm registry (`registry.npmjs.org`) using `NPM_TOKEN` and GitHub Actions provenance (`id-token: write`).
- Configure pre-publish validation gates (`publint` and `@arethetypeswrong/cli`) in CI to catch broken exports or TypeScript declaration resolution issues before release.

**Non-Goals:**
- Creating a separate interactive documentation site (e.g., Storybook or Nextra/Docusaurus) in this change.
- Backporting CommonJS (CJS) dual-bundle output (the library intentionally targets modern ESM and NodeNext/Bundler module resolution).

## Decisions

### Decision 1: Licensing and Packaging Inclusion

Every professional open-source package published to npm requires an explicit, machine-readable license.

* **Decision**: Add an MIT `LICENSE` file under `packages/ui/LICENSE` and the repository root. Add `"LICENSE"` to the `"files"` array in `packages/ui/package.json`.
* **Alternatives Considered**:
  - Relying solely on `"license": "MIT"` in `package.json` without a physical file: Rejected. Automated enterprise compliance scanners (FOSSA, Snyk, Black Duck) flag packages missing a physical license file as unverified.

### Decision 2: Public npm Registry Configuration

* **Decision**: Configure `packages/ui/package.json` with:
  ```json
  "publishConfig": {
    "access": "public"
  }
  ```
  Omit `"registry": "https://npm.pkg.github.com"` so npm and pnpm default to the official registry (`https://registry.npmjs.org`).
* **Alternatives Considered**:
  - Dual publishing to both GitHub Packages and npm: Adds complexity and dual token management with minimal consumer benefit since public npm is globally accessible without credentials.

### Decision 3: npm Provenance via GitHub Actions

Modern npm packages published from CI should generate cryptographic provenance attestations to prove they were built from the authentic GitHub repository commit.

* **Decision**: Add `permissions: id-token: write` to `.github/workflows/release.yml` and pass `--provenance` to the publish script.
* **Requirements**: Uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` in GitHub Actions.

### Decision 4: Automated Pre-Publish Validation Pipeline

* **Decision**: Enforce `publint` and `attw` as pre-publish validation checks in CI to guarantee that all subpaths, type definitions, and styles resolve without errors in external consumer applications.

### Decision 5: Multi-Registry MIT License Compliance and Attribution

The library incorporates and adapts components from multiple open-source registries configured in `components.json` (`@coss`, `@better-auth-ui`, `@reui`, `@magicui`, `@kokonutui`, `@cult-ui`, `@kibo-ui`).

* **Legal Basis**: All 7 upstream sources are distributed under the permissive **MIT License**. The MIT License grants explicit permission to *"use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software"*, provided that the original copyright notice and permission notice are preserved in distributions.
* **Decision**: Maintain a comprehensive `packages/ui/THIRD_PARTY_LICENSES.md` file listing each upstream source, its original author/organization, and its full MIT license text. This completely fulfills legal redistribution criteria.
* **Architectural Policy**: Upstream components originally built on Radix UI or legacy CSS-in-JS are systematically adapted to coss standards:
  - Primitives replaced with `@base-ui/react`.
  - Polymorphism implemented via `useRender` delegation instead of Radix `asChild`.
  - Styling aligned to coss Tailwind CSS v4 design tokens.

### Decision 6: Contribution Architecture and Guidelines

* **Decision**: Provide a `CONTRIBUTING.md` at repository root defining:
  - Development prerequisites (pnpm v12, Node.js 22 LTS).
  - Code style and validation commands (`pnpm format:check`, `pnpm lint`, `pnpm test`, `pnpm build`).
  - Architecture guidelines for importing and adapting shadcn/registry components to coss primitives.
  - Changeset creation workflow for pull requests.

## Risks / Trade-offs

* **[Risk: npm Token Missing in CI]** → If `secrets.NPM_TOKEN` is not added to the repository secrets, GitHub Actions will fail to publish during `release.yml`.  
  *Mitigation*: Document the exact secret creation step in the release setup instructions.
* **[Risk: Accidental Test Code Leakage into Tarball]** → Test files or test types could inflate package size if emitted to `dist/`.  
  *Mitigation*: Already guarded by `packages/ui/tsconfig.build.json` strictly excluding `tests/` and `src/**/*.test.ts*`, confirmed by dry-run `pnpm pack`.
