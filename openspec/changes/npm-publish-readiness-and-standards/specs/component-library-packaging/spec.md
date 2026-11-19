# Spec Delta: component-library-packaging

## MODIFIED Requirements

### Requirement: Private Registry Publishing Configuration

The package manifest SHALL configure `publishConfig` targeting the public npm registry (`https://registry.npmjs.org`) with `"access": "public"` and explicitly enumerated publishable files (`dist`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`).

#### Scenario: Running package publishing check
- **WHEN** a release workflow packages the library
- **THEN** only `dist/`, `README.md`, `LICENSE`, and `THIRD_PARTY_LICENSES.md` are packaged, and publishing targets public access on npm without restriction

## ADDED Requirements

### Requirement: Automated Pre-Publish Hygiene Verification

The repository verification pipeline SHALL run automated packaging linting (`publint`) and type resolution checking (`@arethetypeswrong/cli`) before any package publish event to ensure all subpath exports resolve correctly across both NodeNext and Bundler environments.

#### Scenario: Verifying package subpath integrity
- **WHEN** the CI pipeline executes `package:check`
- **THEN** publint validates that every entry in `package.json#exports` corresponds to an existing, valid `.js` file and `.d.ts` declaration
