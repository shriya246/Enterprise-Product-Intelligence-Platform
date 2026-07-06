# Architecture

## System overview

PulseAI is a Next.js 14 App Router application deployed on Vercel, backed by a single Supabase project (Postgres + Auth + Storage + RLS + pgvector). There is no separate backend service — API routes and server actions inside the Next.js app talk to Supabase directly, either as the signed-in user (respecting RLS) or via a service-role client for the small number of trusted server-only paths (event ingestion).

```
Browser (tracked app)  --pulseai-sdk.js-->  /api/events  --service role-->  Postgres (events)
Browser (PulseAI app)  <--RLS-scoped-->     Supabase Auth + Postgres (everything else)
Server components/actions  --Groq API-->    AI features (chat, clustering, PRD, prioritization)
```

**Current deferred-wiring status:** this codebase is fully built against `.env.example` placeholders. No live Supabase/Groq/Upstash/Vercel/Sentry account is connected yet — that's a deliberate scoping decision for this build pass, not a gap. See `BACKLOG.md`'s "Deferred" section.

## Multi-tenancy model

Every tenant-scoped table carries `org_id` and is protected by Postgres RLS policies keyed off `org_members`, via the `is_org_member(org_id)` / `is_org_admin(org_id)` SQL helper functions (`security definer`, so they can check membership without exposing the whole `org_members` table to policy subqueries). This means tenant isolation holds even if application code has a bug — a leaked query still can't cross an org boundary.

## Database schema

### `profiles`
1:1 with `auth.users`, auto-created via the `handle_new_user()` trigger on signup. Holds `email`, `full_name`.

### `organizations`
`id`, `name`, `slug` (unique, used in URLs as `/org/[slug]/...`), `created_by`, `write_key` (unique, used by the tracking SDK to identify the org without a session).

### `org_members`
Composite PK (`org_id`, `user_id`), `role` enum (`owner` | `admin` | `member`), `invited_by`. This is the RBAC table every other policy checks against.

### `audit_log`
`org_id`, `actor_id`, `action`, `target_type`, `target_id`, `metadata` (jsonb). Readable by admins/owners only. *Write paths for sensitive actions (role changes, org settings) are not yet wired to member management UI — tracked in `BACKLOG.md`.*

### `events`
`org_id`, `distinct_id`, `event_name`, `properties` (jsonb), `occurred_at`. Populated only via the service-role `/api/events` route (no public insert RLS policy) after a valid `write_key` lookup. Indexed on `(org_id, occurred_at)`, `(org_id, event_name)`, `(org_id, distinct_id)`.

### `features`
`org_id`, `key` (matches an `event_name` by convention), `name`, `description`. Registered by org admins; used to compute feature adoption against `events`.

### `feedback_items`
`org_id`, `source` (`manual` | `csv_import`), `author`, `body`, `sentiment`, `theme`, `embedding` (`vector(384)`, reserved for future semantic search — see note below), `created_by`.

**Deviation from plan:** Groq's free tier has no embeddings endpoint, so feedback clustering in this pass is done via a single LLM classification call (`src/lib/ai/feedback-clustering.ts`) rather than an embeddings + k-means pipeline. The `embedding` column and `pgvector` extension remain in the schema for a future pass if a free embeddings source is added; they're not populated today.

## API surface

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/events` | POST | Public, org `write_key` | Event ingestion from the tracking SDK. Rate-limited (100/min per write key). |
| `/api/feedback/cluster` | POST | Session + org membership | Triggers AI theme/sentiment tagging on un-themed feedback. Rate-limited (10/min per user). Returns 501 until `GROQ_API_KEY` is set. |
| `/api/chat` | POST | Session + org membership | AI assistant Q&A grounded in the org's own analytics + feedback summary. Rate-limited (20/min per user). Returns 501 until `GROQ_API_KEY` is set. |

Everything else (org creation, feedback entry/import, feature registration) goes through Next.js server actions rather than a separate API route, since they're only ever called from the app's own forms.

## Frontend structure

- `/login`, `/signup`, `/auth/callback` — auth flows (Supabase Auth, email/password)
- `/onboarding` — list existing orgs, create a new one
- `/org/[slug]/*` — everything else, gated by `requireOrgMembership()` in `src/lib/org.ts`, which resolves the org by slug and confirms membership before rendering (defense in depth alongside RLS)
- `/org/[slug]/dashboard` — analytics: stat tiles, DAU trend, weekly retention, funnel builder, cohort heatmap, feature adoption
- `/org/[slug]/feedback` — manual entry, CSV import, AI clustering trigger
- `/org/[slug]/chat` — AI assistant

## Security

- RLS on every table (see `supabase/migrations/`)
- Zod validation on every API route and server action input
- Upstash-backed rate limiting on public/AI-triggering endpoints (fails open — i.e., no-ops — until Upstash credentials are connected, so local dev isn't blocked)
- Security headers set globally in `next.config.mjs` (frame options, content-type sniffing, referrer policy, permissions policy, HSTS)
- No hardcoded secrets — everything server-only reads from `process.env`, validated against `.env.example`

## Testing

`src/lib/analytics.ts` (the DAU/WAU/MAU, retention, funnel, cohort, and adoption math) is unit tested with Vitest (`src/lib/analytics.test.ts`) since it's pure and DB-agnostic — this is deliberately where test coverage concentrates, since it's the logic most likely to have an off-by-one bug and cheapest to verify without a live database.

## Known limitations at this pass

- No live external services connected (see top of this doc)
- No email delivery configured, so signup confirmation emails depend on Supabase Auth's default (rate-limited on the free tier — a real constraint at scale, noted here per the plan's zero-dollar constraint discipline)
- Org invitations aren't implemented — a new member currently has no way to join an org except knowing its slug and being added directly to `org_members` (this is `BACKLOG.md`'s "Org settings" item)
