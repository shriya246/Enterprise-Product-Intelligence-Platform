# Security Audit

*As of this build pass — re-run this checklist whenever a table or public route is added.*

## Row-level security

Every table in `public` has RLS enabled and at least one policy. All access is scoped through `is_org_member(org_id)` / `is_org_admin(org_id)` (both `security definer` functions in `0001_core_schema.sql`), so a compromised or buggy query still can't cross an org boundary.

| Table | RLS enabled | Select | Write |
|---|---|---|---|
| `profiles` | Yes | Self, or any org co-member (`0006_profiles_org_visibility.sql`) | Self only |
| `organizations` | Yes | Org members | Insert: creator only. Update: owner/admin |
| `org_members` | Yes | Org members | Admin/owner only, with a bootstrap carve-out for the very first member of a brand-new org |
| `audit_log` | Yes | Admin/owner only | Any member can write (actor must be themselves) |
| `events` | Yes | Org members | No direct insert policy — writes only via the service-role `/api/events` route |
| `features` | Yes | Org members | Admin/owner only |
| `feedback_items` | Yes | Org members | Insert: any member. Update/delete: admin/owner |
| `roadmap_items` | Yes | Org members | Insert/update: any member. Delete: admin/owner |
| `roadmap_item_dependencies` | Yes | Org members | Any member |
| `prd_drafts` | Yes | Org members | Insert: any member (no update/delete — drafts are immutable history) |
| `feature_flags` | Yes | Org members | Admin/owner only |
| `experiments` | Yes | Org members | Any member |

**Deliberate gaps:**
- `events` has no client-facing insert policy at all — this is intentional, not an oversight. The only write path is the service-role `/api/events` route, which authenticates via `write_key` instead of a session.
- `org_members` insert policy has an `or not exists(...)` bootstrap clause so the very first member (the org creator) can be added before any admin exists to authorize it. This only fires when the org has zero members, so it can't be used to self-promote into an existing org.

## Application-layer defense in depth

`src/lib/org.ts`'s `requireOrgMembership()` re-checks membership at the application layer before every `/org/[slug]/*` page renders, and every API route independently re-checks `org_members` before doing anything — so a bug in one layer (RLS or app code) doesn't silently become an authorization bypass on its own.

## Input validation

Every API route and server action validates its input with Zod before touching the database (see `src/lib/validation/*.ts`). No raw `request.json()` or `FormData` value reaches a Supabase call unparsed.

## Rate limiting

Backed by Upstash Redis (`src/lib/rate-limit.ts`), keyed per-identifier with a sliding window. **Fails open** (no-ops) until `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are connected — acceptable for this pass since nothing is live yet, but this is the first thing to verify once real Upstash credentials are added.

| Endpoint | Identifier | Limit |
|---|---|---|
| `POST /api/events` | write key | 100 / 60s |
| `POST /api/feedback/cluster` | user id | 10 / 60s |
| `POST /api/chat` | user id | 20 / 60s |
| `POST /api/roadmap/prioritize` | user id | 10 / 60s |
| `POST /api/prd/generate` | user id | 10 / 60s |
| `GET /api/flags/evaluate` | write key | 300 / 60s |

Server actions (org creation, feedback entry, roadmap items, flags, experiments) aren't separately rate-limited — they require an authenticated session, so RLS + Supabase Auth's own rate limits are the first line of defense there, consistent with typical practice for authenticated-only write paths.

## Secrets & headers

- No secret is hardcoded anywhere in the codebase — everything server-only reads from `process.env`, validated against `.env.example`.
- `next.config.mjs` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` globally.
- `SUPABASE_SERVICE_ROLE_KEY` is only ever imported in `src/lib/supabase/admin.ts`, which is used exclusively in trusted server-only paths (`/api/events`, the org-settings email lookup) — never in a client component.

## Error tracking

Sentry (`@sentry/nextjs`) is wired for client, server, and edge runtimes (`instrumentation.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) plus a `global-error.tsx` for React render errors. All three `Sentry.init()` calls are gated on `NEXT_PUBLIC_SENTRY_DSN` being set, so this is fully inert until a real Sentry project is connected — no-op today by design, not broken.

## Test coverage

`src/lib/analytics.ts` (DAU/WAU/MAU, retention, cohorts, funnels, feature adoption) and `src/lib/stats/ab-test.ts` (the two-proportion z-test behind experiment significance) are unit tested with Vitest — these are the two places a silent math bug would be hardest to notice and easiest to verify without a live database. UI and API routes are not yet covered by automated tests; manual verification via `npm run build` + reading the code has been the check for this pass, noted here as a known gap rather than left unstated.
