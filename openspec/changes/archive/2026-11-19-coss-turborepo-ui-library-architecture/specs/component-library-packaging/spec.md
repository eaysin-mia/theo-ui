# Spec Delta

## ADDED Requirements

### Requirement: Private Registry Publishing Configuration

The package manifest SHALL configure `publishConfig` targeting the designated private npm or GitHub Packages registry with restricted access and explicitly enumerated publishable files (`dist`, `README.md`, `THIRD_PARTY_LICENSES.md`).

#### Scenario: Running package publishing check
- **WHEN** a release workflow packages the library
- **THEN** only `dist/`, `README.md`, and license files are packaged, and publishing targets `publishConfig.registry` with restricted access

### Requirement: Unbundled Multi-File ESM Output Contract

The build pipeline SHALL emit a 1-to-1 unbundled ESM file structure from `src/` to `dist/`, maintaining separate modules and preserving `"use client"` directives at the top of client files to ensure zero-bundle-overhead tree shaking.

#### Scenario: Subpath import tree shaking
- **WHEN** a consumer imports `@theo/ui/components/button`
- **THEN** the consumer bundler loads only `dist/components/button.js` and its direct dependencies without evaluating unrelated components
