# PulseAI

PulseAI is a unified product intelligence workspace for product teams. It brings product analytics, customer feedback, and AI-generated insight into one place, so a product manager can go from "why is retention dropping" to a prioritized roadmap decision without stitching together three separate tools.

## What it replaces

Today, a product team runs a fragmented stack: an analytics tool (Mixpanel/Amplitude) for usage data, a support/feedback tool (Zendesk-style) for customer voice, a roadmap tool (Productboard-style) for planning, and a chat AI tab on the side for making sense of it all. PulseAI collapses that into one workspace with an AI layer that reasons directly over your own product data and feedback.

## Who it's for

- **Product Managers** — fast answers, not more dashboards to babysit
- **Product Analysts** — raw data access, cohort and funnel tooling
- **UX Researchers** — qualitative feedback clustering and sentiment
- **Engineering Managers** — feature adoption tied to sprint decisions
- **Executives** — a single KPI view, not a self-serve analytics tool

## Core capabilities

- Multi-tenant organizations with role-based access (owner/admin/member) and an audit log
- Lightweight event ingestion SDK for tracking product usage
- Analytics dashboard: DAU/WAU/MAU, retention curves, funnels, cohorts, feature adoption
- Feedback intake via manual entry or CSV import, auto-clustered into themes with sentiment
- An AI assistant that answers plain-English questions against your org's own analytics and feedback data
- A roadmap module with AI-assisted prioritization based on engagement and feedback signals
- An AI PRD generator that drafts user stories, acceptance criteria, success metrics, and risks from a feature idea
- Lightweight experimentation: feature flags, A/B splits, and significance checks
- An executive dashboard rolling up the KPIs that matter into a single screen

## Tech stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Supabase for Postgres, Auth, Storage, and row-level security (with pgvector for embeddings). Recharts for visualization. Upstash Redis for caching and rate limiting. Groq for AI inference. Every service runs on a free tier.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase / Groq / Upstash values
npm run dev
```

See `ARCHITECTURE.md` for the database schema and API surface, and `PRD.md` for full product requirements.

## Project status

See `ROADMAP.md` for what's shipped and what's next, and `BACKLOG.md` for the current feature checklist.
