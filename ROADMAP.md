# Roadmap

## MVP (this build pass)

Everything in `BACKLOG.md`, delivered as one continuous pass rather than staged sprints:

- Multi-tenant foundation: auth, orgs, RBAC, audit log
- Event ingestion SDK + analytics dashboard (DAU/WAU/MAU, retention, funnels)
- Feedback ingestion (manual + CSV) + AI clustering/sentiment
- AI chat assistant over org data
- Cohort analysis + feature adoption views
- Roadmap module + AI-recommended prioritization
- AI PRD generator
- Feature flags + A/B experimentation with significance checks
- Executive dashboard
- CI/CD, security hardening pass, basic test coverage

**Status:** in progress — see `BACKLOG.md` for the live checklist and `PROGRESS_LOG.md` (private) for build-by-build detail.

**Known limitation at MVP:** no live external service is connected yet (Supabase/Groq/Upstash/Vercel/Sentry) — the codebase is fully wired against `.env.example` placeholders, ready to go live once real accounts are connected. This was a deliberate scoping decision for this pass, not a gap in the implementation.

## V1 (post-MVP)

- Live service connection + first real deployment to Vercel
- Real onboarding: invite teammates by email, not just by knowing the org slug
- Org settings: member role management UI, org-level billing placeholder (still free-tier, just the settings surface)
- Slack/email digest of weekly KPI summary
- Saved/shareable dashboard views
- CSV export of any chart or table for board decks

## V2 (future)

- Native mobile SDKs (iOS/Android) alongside the web JS snippet
- Deeper feedback source integrations (still free-tier-compatible — e.g., public App Store review scraping) beyond CSV import
- Multi-metric custom dashboards (user-defined KPI rollups beyond the fixed executive view)
- Experiment templates (common A/B test patterns pre-built, not just a blank flag + split)
- Role-based views tuned per persona (see `PERSONAS.md`) rather than one dashboard for everyone
