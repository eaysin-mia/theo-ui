# open-source-licensing-and-compliance Specification

## Purpose

Defines the legal licensing terms, copyright attribution, license file distribution in published packages, and third-party dependency notice management.

## Requirements

### Requirement: Open Source License Distribution

The repository and published npm packages SHALL include a formal MIT License file (`LICENSE`) that grants developers unambiguous rights to inspect, consume, and modify the source code.

#### Scenario: Inspecting package distribution for license
- **WHEN** a consumer downloads `@theo/ui` from the npm registry or unpacks the package tarball
- **THEN** the root of the published package contains an identical copy of the MIT `LICENSE` file

#### Scenario: Third-party notices attribution
- **WHEN** the package is built and distributed
- **THEN** third-party notices and licenses (`THIRD_PARTY_LICENSES.md`) are bundled alongside the primary `LICENSE` file

### Requirement: Multi-Registry Upstream Attribution

The package SHALL maintain comprehensive attribution for all upstream open-source registries configured in `components.json` (`@coss`, `@better-auth-ui`, `@reui`, `@magicui`, `@kokonutui`, `@cult-ui`, `@kibo-ui`), preserving original MIT copyright notices while documenting modifications made to adhere to the coss design system.

#### Scenario: Auditing upstream component licenses
- **WHEN** an enterprise legal review audits `@theo/ui` for third-party compliance
- **THEN** `THIRD_PARTY_LICENSES.md` explicitly lists every upstream source registry, upstream repository URL, original license type (MIT), and copyright holders

### Requirement: Open Source Contribution Guidelines

The repository root SHALL provide a `CONTRIBUTING.md` document defining setup instructions, coding conventions, testing expectations, and guidelines for porting upstream shadcn/Radix components to coss / Base UI primitives.

#### Scenario: Onboarding community contributor
- **WHEN** a contributor inspects the repository to contribute a new component or fix
- **THEN** `CONTRIBUTING.md` outlines the PR workflow, branch conventions, formatting, test commands, and coss architectural patterns
