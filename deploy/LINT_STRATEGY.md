# Lint Strategy

## Purpose

Deployment Phase 2 separates frontend and backend validation responsibility without mass-refactoring source files.

## Frontend Responsibility

Frontend lint is owned by the root Next.js project.

Command:

```bash
npm run lint:frontend
```

Current scope:

- `app`
- `scripts`
- `tailwind.config.mjs`
- `next.config.ts`

Generated output and backend project files are excluded from root ESLint.

## Backend Responsibility

Backend validation is owned by `tpl-api`.

Current backend gate:

```bash
npm run lint:backend
```

This delegates to:

```bash
npm --prefix tpl-api run typecheck
```

Rationale: `tpl-api` does not currently define a dedicated ESLint setup. Backend deployment readiness is verified by backend build, backend typecheck, and backend tests.

## Root Lint

Root lint runs frontend lint only:

```bash
npm run lint
```

This prevents Next.js/frontend rules from being applied to backend server code.

## Known Remaining Lint Debt

Frontend source lint still fails due to existing source-level issues, including:

- `@typescript-eslint/no-explicit-any`
- React hook/compiler lint findings
- `react/no-children-prop`

These are tracked as source lint debt and were not mass-refactored in Deployment Phase 2 because the phase is limited to deployment readiness fixes and must preserve existing booking, wallet, pricing, and UI behavior.
