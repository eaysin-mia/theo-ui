# Proposal

## Why

Publishing `@theo/ui` to the public npm registry as an enterprise-grade open-source UI library requires meeting modern industry standards for package distribution, licensing, type contracts, and automated release verification. While the core codebase, components, and Vitest test suite are functional, critical publication prerequisites are currently missing: official `LICENSE` files, public npm registry configuration in CI/CD, npm provenance attestation, and complete package metadata. 

Addressing these gaps ensures `@theo/ui` installs reliably in any external React 19 project without configuration errors or security warnings.

## What Changes

- Add root and package-level `LICENSE` files (MIT) and ensure they are bundled in npm release tarballs (`packages/ui/package.json` `files` field).
- Add `CONTRIBUTING.md` detailing contribution workflows, local development setup, testing standards, and coss / Base UI porting guidelines for community contributors.
- Update `packages/ui/THIRD_PARTY_LICENSES.md` to comprehensively attribute all 7 upstream registries declared in `components.json` (`@coss`, `@better-auth-ui`, `@reui`, `@magicui`, `@kokonutui`, `@cult-ui`, `@kibo-ui`).
- Update `.github/workflows/release.yml` from GitHub Packages to the official public npm registry (`https://registry.npmjs.org`), adding `id-token: write` permission for npm provenance generation.
- Standardize package metadata in `packages/ui/package.json` (`name: "@theo/ui"`, `"publishConfig": { "access": "public" }`, repository URL, and license references).
- Enforce automated pre-publish quality gates in CI (`publint` and `@arethetypeswrong/cli`) to guarantee NodeNext/Bundler module resolution compatibility.
- Ensure package documentation (`packages/ui/README.md`) provides clear installation, peer dependency setup, and usage recipes for external consumers.

## Capabilities

### New Capabilities

- `open-source-licensing-and-compliance`: Defines the licensing terms, copyright attribution, license file placement in published npm distributions, and third-party license notices.

### Modified Capabilities

- `component-library-packaging`: Extend package metadata, subpath exports validation, and npm tarball inclusion rules for public registry publication.
- `turborepo-workspace-architecture`: Update the automated release workflow to publish to public npm with provenance attestations and proper token credentials.

## Impact

- `packages/ui/package.json`: Updated metadata, license, and `files` fields.
- `LICENSE`: Added to root and `packages/ui/`.
- `.github/workflows/release.yml`: Configured for public npm registry with provenance.
- External consumers: Enables zero-friction `pnpm add @theo/ui` installation across any React 19 framework (Next.js, Remix, Vite).
