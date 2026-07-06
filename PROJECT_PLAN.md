# PulseAI — Project Plan

## Vision & business case

PulseAI is a unified AI-native product intelligence workspace for Product Managers, Analysts, UX Researchers, Engineering Leads, and Executives. It replaces the fragmented stack of product analytics (Mixpanel/Amplitude), feedback tools (Zendesk), roadmap tools (Productboard), and ad-hoc AI chat with one workspace where product data, customer feedback, and AI-generated recommendations live together.

**Problem it solves:** PMs waste hours stitching together data from disconnected tools before they can make a single decision. PulseAI collapses that into one place with an AI layer that can answer "why is retention dropping" or "which roadmap item should we prioritize" directly from the underlying data.

**Positioning:** an AI-first alternative to running Mixpanel + Productboard + a chat AI tab side by side.

## Target users

See `PERSONAS.md` for full detail. Core personas: Product Manager (primary), Product Analyst, UX Researcher, Engineering Manager, Executive.

## Tech stack (all free tier)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Free, deploys free on Vercel |
| Hosting | Vercel (Hobby/free tier) | Zero cost, CI/CD built in |
| Database + Auth | Supabase (free tier: Postgres, Auth, Storage, RLS, pgvector) | One free backend for everything, RLS gives multi-tenancy for free |
| Charts | Recharts | Free, React-native |
| Caching / rate limiting | Upstash Redis (free tier) | Serverless-friendly, generous free quota |
| AI layer | Groq API (free tier, Llama 3.3 70B / 3.1 8B) | Free, fast inference, no paid quota needed at this scale |
| Background jobs | Vercel Cron (free) or Supabase Edge Functions (free tier) | No paid queue needed at this scale |
| Error tracking | Sentry (free developer tier) | Optional but free |

Security playbook: Argon2id via Supabase Auth, Supabase RLS on every table, Zod validation on every API route, parameterized queries only, rate-limiting via Upstash on all public endpoints, full security headers, no hardcoded secrets, npm audit/Dependabot enabled.

## Delivery approach

Originally scoped as three sprints (Foundation & Core Data Layer; Feedback Intelligence + AI Insights; Roadmap/PRD/Experimentation/Executive Layer). Delivered as a single continuous build pass covering all three themes, tracked feature-by-feature in `BACKLOG.md`. See `ROADMAP.md` for current status and `EXECUTIVE_SUMMARY.md` for the latest snapshot.

### Theme 1 — Foundation & Core Data Layer

Auth, organizations, teams, RBAC (owner/admin/member), audit log. Core schema: organizations, users, events, features, feedback_items. Event ingestion API (SDK snippet) + storage. Analytics dashboard v1: DAU/WAU/MAU, retention curve, funnel builder. CI/CD to Vercel.

### Theme 2 — Feedback Intelligence + AI Insights

Feedback ingestion (manual entry + CSV import). AI clustering of feedback into themes + sentiment tagging. AI chat assistant answering natural-language questions against the org's own analytics + feedback data. Cohort analysis + feature adoption views.

### Theme 3 — Roadmap, PRD Generator, Experimentation, Executive Layer

Roadmap module: prioritized items, dependencies, timeline, AI-recommended prioritization using engagement + feedback data. AI PRD generator: feature idea → user stories, acceptance criteria, success metrics, risks. Lightweight experimentation: feature flags, A/B split, significance check. Executive dashboard: single-screen KPI rollup. Hardening pass: RLS audit, rate-limit audit, error tracking, basic test coverage.

## Zero-dollar constraint

Every service used must have a genuinely free tier that this project stays within. Where a free-tier limit would be a real constraint at production scale, it's noted in `ARCHITECTURE.md` as a known limitation rather than silently exceeded.
