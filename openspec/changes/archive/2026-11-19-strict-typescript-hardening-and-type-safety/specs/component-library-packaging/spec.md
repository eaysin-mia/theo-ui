# Spec Delta

## ADDED Requirements

### Requirement: Strict Type Declaration Emission and Compiler Policy

The build pipeline SHALL emit TypeScript declaration files (`.d.ts` and `.d.ts.map`) generated under strict compiler rules (`strict: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`), ensuring zero ambient type leakage and full compatibility with consumer projects configured for either NodeNext or bundler module resolution.

#### Scenario: Consumer project compiling with strict NodeNext
- **WHEN** an external project with `"moduleResolution": "NodeNext"` imports `@theo/ui` subpaths
- **THEN** TypeScript resolves the corresponding `.d.ts` declaration maps with zero compiler warnings or resolution errors
