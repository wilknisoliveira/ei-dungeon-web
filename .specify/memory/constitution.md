<!-- Sync Impact Report
  Version change: (template) → v1.0.0
  Modified principles: None (initial fill from template)
  Added sections: I. Dark Fantasy Visual Identity, II. Angular Component Architecture,
    III. Tokenized Theming System, IV. Security-First Authentication,
    V. Test Coverage Discipline, Technology Stack & Conventions section,
    Development Workflow section, Governance section
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ generic, no update needed
    - .specify/templates/spec-template.md ✅ no constitution-specific references
    - .specify/templates/tasks-template.md ✅ no constitution-specific references
    - .specify/templates/checklist-template.md ✅ no constitution-specific references
    - .specify/extensions/git/commands/*.md ✅ no agent-specific names, all generic
    - .specify/templates/constitution-template.md ✅ source template, unchanged
  Follow-up TODOs: None
-->

# EI Dungeon Web Constitution

## Core Principles

### I. Dark Fantasy Visual Identity (NON-NEGOTIABLE)

The application MUST present a Dark Fantasy / Gritty visual identity
targeting solo RPG players seeking an immersive atmospheric experience.

- The CSS custom property token system defined in `src/styles.scss` is the
  single source of truth for colors, surfaces, and text styles.
- All components MUST use `var(--color-*)`, `var(--surface*)`,
  `var(--text-*)`, `var(--background)` tokens — no hardcoded color values.
- The theme defines: deep charcoals and blacks for backgrounds, rich
  crimson/blood red for primary, aged gold/brass for accents, muted
  teal/emerald for secondary elements, warm off-white/parchment for text.
- Typography MUST use a serif gothic/roman heading font (Cinzel or Playfair
  Display) with clean sans-serif body (Roboto or Montserrat).
- The EI-DUNGEON wordmark and a fantasy-themed icon MUST appear on Auth
  and Signup pages.

### II. Angular Component Architecture

Every feature MUST follow Angular 16 conventions with modular architecture.

- Components belong to feature modules under `src/app/pages/` or the
  `src/app/shared/` module for reusable components.
- Lazy-loaded routing via `loadChildren` is the default for feature modules.
- Component styles MUST be SCSS and scoped to the component.
- TypeScript strict typing MUST be used throughout — no `any` without
  explicit justification.
- Services encapsulate business logic and HTTP communication; components
  handle presentation only.

### III. Tokenized Theming System

The theme system defined in `src/styles.scss` is mandatory for all visual
presentation.

- Dark theme (`body.theme-dark`) is the default and MUST be applied on
  initial load.
- Light theme (`body.theme-light`) MUST be toggled via the
  `app-theme-toggle` component only.
- Angular Material theme tokens MUST flow through the `expose-theme` mixin
  to populate CSS custom properties.
- Theme preference MUST persist in `localStorage` under the `app-theme` key.
- Overlay containers (CDK overlay, dialogs, snackbars) MUST match the
  active theme class.

### IV. Security-First Authentication

Authentication and authorization MUST use JWT with role-based guards.

- `AuthGuard` MUST protect all routes except login and signup.
- `HasRoleGuard` MUST enforce role-based access control where specified.
- The `AuthInterceptor` MUST attach the Bearer JWT token to all HTTP
  requests.
- Tokens MUST be decoded via `jwt-decode` on the client for role extraction.
- Login and signup forms MUST validate input before submission.

### V. Test Coverage Discipline

All code MUST be tested using Jasmine with the Karma test runner.

- Component specs MUST exist for every page and shared component.
- Service specs MUST cover all public methods, including error handling.
- Guards and interceptors MUST have corresponding test specs.
- Tests MUST be run via `ng test` before any pull request is submitted.
- A spec file SHOULD accompany every new `.ts` file.

## Technology Stack & Conventions

### Stack
- **Framework**: Angular 16.x with Angular Material 16.x
- **Language**: TypeScript 5.1.x (strict mode)
- **Styles**: SCSS (component-scoped) with Angular Material theming
- **Testing**: Jasmine 4.6 + Karma 6.4
- **HTTP**: Angular HttpClient with custom interceptors
- **Auth**: JWT with `jwt-decode` library
- **Animations**: Angular BrowserAnimationsModule + CDK

### Conventions
- **Indentation**: 4 spaces (per `.editorconfig`)
- **Quotes**: Single quotes for TypeScript (per `.editorconfig`)
- **File naming**: `kebab-case` for files, `PascalCase` for
  classes/components, `camelCase` for methods/variables
- **Component selector prefix**: `app-`
- **Environment config**: `src/environments/environment.ts` for dev,
  `.prod.ts` for production
- **Production budgets**: Initial bundle <500kb warning / <1mb error;
  component styles <2kb warning / <4kb error

## Development Workflow

### Git Workflow
- Feature branches follow the pattern `NNN-feature-name` (sequential
  numbering) or `YYYYMMDD-HHMMSS-feature-name` (timestamp).
- The main/default branch is the source of truth for releases.
- Commits MUST be atomic and scoped to a single logical change.
- Commit messages MUST be descriptive and prefixed by scope when
  applicable (e.g., `feat:`, `fix:`, `config:`, `refactor:`).

### Quality Gates
1. **TypeScript compilation**: `ng build` MUST pass without errors.
2. **Tests**: `ng test` MUST pass with all specs green before merge.
3. **Constitution Check**: All new features MUST be validated against the
   Core Principles in their implementation plan. Violations MUST be
   documented with justification in the Complexity Tracking section.
4. **Production build**: `ng build --configuration production` MUST succeed
   within budget limits.

### Review Process
- Every pull request MUST reference the corresponding feature specification.
- Reviewer MUST verify constitution principle compliance.
- Complexity justification MUST be provided for any deviation from
  principle requirements.

## Governance

This Constitution supersedes all other development practices. Amendments
require:

1. **Documentation**: The proposed change MUST be documented with rationale.
2. **Approval**: Changes to Core Principles require team review and
   consensus.
3. **Migration Plan**: Any removal or redefinition of a principle MUST
   include a migration plan for existing code.
4. **Versioning**:
   - MAJOR: Backward-incompatible governance/principle removals or
     redefinitions.
   - MINOR: New principle/section added or materially expanded guidance.
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
5. **Compliance Review**: All PRs and implementation plans MUST verify
   compliance with the current constitution version.

**Version**: 1.0.0 | **Ratified**: 2024-08-06 | **Last Amended**: 2026-07-19
