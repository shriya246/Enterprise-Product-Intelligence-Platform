# Backlog

Living feature checklist. Items are tagged by the theme they originated from (Sprint 1/2/3 in the original plan) but are being built as one continuous pass. Checked off as each vertical slice ships and is pushed.

## Foundation & Core Data Layer [Sprint 1]

- [x] Project scaffold, tooling, `.gitignore`, dependencies
- [x] Database schema & migrations: organizations, org_members (RBAC), audit_log, events, features, feedback_items
- [x] Supabase client wiring (browser + server) with env placeholders
- [x] Auth: sign up, log in, log out, session handling
- [x] Organizations: create org, RBAC (owner/admin/member) enforced via RLS
- [ ] Org settings: invite/manage members, role changes
- [ ] Audit log: writes on sensitive actions (member role changes, org settings)
- [x] Event ingestion: SDK snippet (`public/pulseai-sdk.js`) + `/api/events` route + Zod validation + rate limiting
- [x] Analytics dashboard v1: DAU/WAU/MAU cards, retention curve, basic funnel builder
- [ ] CI/CD: `vercel.json`, GitHub Actions workflow (lint + typecheck + build on push)
- [x] PM docs: `PRD.md`, `PERSONAS.md`, `COMPETITIVE_ANALYSIS.md`, `KPI_FRAMEWORK.md`, `ROADMAP.md`

## Feedback Intelligence + AI Insights v1 [Sprint 2]

- [x] Feedback ingestion: manual entry form
- [x] Feedback ingestion: CSV import
- [x] AI clustering of feedback into themes + sentiment tagging (Groq, wired but unconnected)
- [x] AI Chat Assistant v1: NL Q&A against org's own analytics + feedback data
- [x] Cohort analysis view
- [x] Feature adoption view
- [x] PM docs: `ARCHITECTURE.md` (full schema + API spec), `EXECUTIVE_SUMMARY.md` (v1)

## Roadmap, PRD Generator, Experimentation, Executive Layer [Sprint 3]

- [x] Roadmap module: create/prioritize items, dependencies, timeline view
- [x] AI-recommended roadmap prioritization (engagement + feedback signals)
- [x] AI PRD Generator: feature idea → user stories, acceptance criteria, success metrics, risks
- [x] Feature flags: create/toggle flags scoped to org
- [x] A/B experimentation: simple split + significance check (simple-statistics)
- [ ] Executive Dashboard: single-screen KPI rollup
- [ ] Hardening: RLS policy audit doc, rate-limit audit, Sentry wiring, basic test coverage on core flows
- [ ] PM docs: `GTM_STRATEGY.md`, `PRICING_STRATEGY.md`, `EXECUTIVE_SUMMARY.md` (final), `EXECUTIVE_PRESENTATION.md`

## Deferred (explicitly out of scope for this pass)

- [ ] Connecting real Supabase/Groq/Upstash/Vercel/Sentry accounts and running live end-to-end (user will wire up manually)
