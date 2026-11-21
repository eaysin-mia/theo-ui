# Tasks

## 1. Legal and Licensing Compliance

- [x] 1.1 Update `packages/ui/package.json` `"files"` array to explicitly include `"THIRD_PARTY_LICENSES.md"`.
- [x] 1.2 Update `packages/ui/THIRD_PARTY_LICENSES.md` to attribute all 7 upstream registries declared in `components.json` (`@coss`, `@better-auth-ui`, `@reui`, `@magicui`, `@kokonutui`, `@cult-ui`, `@kibo-ui`).

## 2. Package Manifest and Distribution Hygiene

- [x] 2.1 Update `packages/ui/package.json` repository and homepage metadata pointing to `https://github.com/eaysin-mia/theo-ui`.
- [x] 2.2 Verify `.gitignore` prevents tarball archives (`*.tgz`) and local build artifacts from being tracked.
- [x] 2.3 Run `pnpm --filter @theo/ui exec publint` and verify package subpaths, styles, and types pass without warnings.

## 3. Automated Release Workflow and Provenance

- [x] 3.1 Update `.github/workflows/release.yml` permissions to add `id-token: write` for cryptographic npm provenance.
- [x] 3.2 Update `.github/workflows/release.yml` to target `https://registry.npmjs.org` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
- [x] 3.3 Configure package manifest with `publishConfig.provenance: true` and `publishConfig.access: "public"`.

## 4. Documentation and Final Verification

- [x] 4.1 Update `packages/ui/README.md` to document public npm installation (`pnpm add @theo/ui`), styling import (`@theo/ui/styles.css`), and peer dependency setup.
- [x] 4.2 Create `CONTRIBUTING.md` defining development setup, PR workflow, Vitest testing expectations, and component adaptation guidelines.
- [x] 4.3 Run `pnpm --filter @theo/ui build && pnpm --filter @theo/ui test` and verify clean execution.
- [x] 4.4 Execute `pnpm pack --dry-run` in `packages/ui` to verify that only production code, types, and notice files are packaged in the final npm tarball.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
