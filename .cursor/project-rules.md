# Project Development Rules

These rules govern day-to-day development of the **Multi-Tenant GoHighLevel AI SaaS**.  They complement the technical roadmap in `ROADMAP.md` and the Cursor workspace rules.

---
## 1  Branch & Commit Hygiene
1. Branch naming: `feat/<task-id>-<slug>`, `fix/<task-id>-<slug>`, `chore/<scope>`
2. Use [Conventional Commits](https://www.conventionalcommits.org) with roadmap task-ID in the header, e.g.  
   `feat(A-1): add TenantSecret model`.
3. One PR per task unless tasks are inseparable.

## 2  Definition of Done (DoD)
A task is ✅ **Done** when:
1. Code passes `pnpm lint`, `pnpm test`, `tsc --noEmit`.
2. Unit / integration tests written or updated.
3. Documentation updated (ROADMAP box checked, README/ADR if needed).
4. No secrets or tokens emitted in logs (verified by CI grep).
5. PR approved by ≥1 reviewer (pair-programming if solo).

## 3  Security & Secrets
1. Never log raw `access_token`, `refresh_token`, or Bearer headers.
2. `.env*` files must be git-ignored.
3. Tenant credentials are stored only via encrypted `TenantSecret` rows or the chosen vault.
4. New third-party dependencies must pass `pnpm audit`.

## 4  Testing Baseline
1. ≥90 % coverage on new modules, ≥80 % project-wide.
2. Every PR adds at least one happy-path & one edge-case test.
3. End-to-end smoke test (`docker compose up && curl /health`) must remain green.

## 5  CI/CD Gates
1. PRs merge only from green GitHub Actions pipelines.
2. `main` remains deployable; releases are made via tag + pipeline.

## 6  Code Style & Tooling
1. Prettier + ESLint auto-fix on commit (`husky pre-commit`).
2. TypeScript `strict` mode stays enabled.
3. Log levels: `info`, `warn`, `error`; no `debug` in production.

## 7  Observability First
1. All long-running components export Prometheus metrics.
2. Winston logs include `tenantId` and `requestId` where relevant.
3. Unhandled promise rejections crash the process; Docker/PM2 restarts captured via metrics.

## 8  Documentation Cadence
1. Update `ROADMAP.md` Kanban table upon each merge.
2. Add Architecture Decision Records (ADRs) for impactful infra/security decisions.

---
**Last updated:** <!-- cursor will auto-update timestamp on save --> 