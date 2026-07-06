# Product Requirements Document — PulseAI

## Summary

PulseAI is a unified product intelligence workspace: product analytics, customer feedback, and AI-generated insight in one place, so a product team can go from raw signal to a prioritized, documented decision without leaving the tool. See `PROJECT_PLAN.md` for the business case and `PERSONAS.md` for who this serves.

## v1 scope (this build pass)

### 1. Multi-tenant foundation
- **Requirement:** Every table scoped to an organization; users belong to one or more orgs with a role (owner/admin/member) enforced by Postgres RLS, not just application logic.
- **Acceptance criteria:** A user in Org A can never read Org B's rows, even via a crafted API request, because RLS denies it at the database layer regardless of application bugs.
- **Status:** Shipped — see `supabase/migrations/0001_core_schema.sql`.

### 2. Event ingestion
- **Requirement:** A lightweight JS snippet any web app can drop in to send usage events, authenticated by a per-org write key (not a signed-in session, since the tracked app is a third-party product).
- **Acceptance criteria:** `pulseai.init(writeKey); pulseai.track("event_name", {props})` results in a row in `events` scoped to the correct org, rate-limited to prevent abuse of the public endpoint.
- **Status:** Shipped — `public/pulseai-sdk.js`, `/api/events`.

### 3. Analytics dashboard v1
- **Requirement:** DAU/WAU/MAU stat tiles, a daily active users trend chart, a weekly cohort retention curve, and a funnel builder where a user selects an ordered sequence of event names and sees step-by-step conversion.
- **Acceptance criteria:** Numbers are computed from real rows in `events` for the signed-in user's org only; funnel steps are selectable, not hardcoded.
- **Status:** Shipped — `src/app/org/[slug]/dashboard`.

### 4. Feedback intelligence
- **Requirement:** Manual feedback entry and CSV import; AI clustering into themes with sentiment tagging.
- **Acceptance criteria:** A CSV of feedback rows imports into `feedback_items`; each row gets a sentiment label and a theme assignment from the AI layer (Groq + pgvector embeddings) once a real API key is connected.
- **Status:** Planned this pass, see `BACKLOG.md`.

### 5. AI chat assistant
- **Requirement:** Natural-language Q&A that answers from the org's own analytics and feedback data — not generic chat.
- **Acceptance criteria:** A question like "why is retention dropping" triggers a query against the org's real `events`/`feedback_items` tables, and the answer cites the underlying numbers.
- **Status:** Planned this pass.

### 6. Roadmap module
- **Requirement:** Create and prioritize roadmap items, express dependencies, view on a timeline; AI-recommended priority ranking using engagement and feedback signals.
- **Acceptance criteria:** Each roadmap item can link to a `features` row so its adoption data informs the AI's suggested rank.
- **Status:** Planned this pass.

### 7. AI PRD generator
- **Requirement:** Given a feature idea (a few sentences), generate a draft PRD: user stories, acceptance criteria, success metrics, risks.
- **Acceptance criteria:** Output is a structured draft a PM edits, not a finished document — framed as a starting point.
- **Status:** Planned this pass.

### 8. Experimentation
- **Requirement:** Feature flags scoped to an org, a simple A/B split, and a significance check using a free stats library.
- **Acceptance criteria:** A flag can be toggled per-org; an experiment reports whether the observed difference between variants is statistically significant, not just "which number is bigger."
- **Status:** Planned this pass.

### 9. Executive dashboard
- **Requirement:** Single-screen KPI rollup: DAU/WAU/MAU, retention, adoption, and an NPS placeholder, with no interaction required to configure it.
- **Acceptance criteria:** Loads in one view, no filters required to get value, safe to project on a screen in a board meeting.
- **Status:** Planned this pass.

## Non-functional requirements

- **Security:** RLS on every table, Zod validation on every API route, rate limiting on public endpoints, no hardcoded secrets, standard security headers (see `next.config.mjs`).
- **Cost:** Every dependency must run on a genuinely free tier at the scale this project operates at (see `PROJECT_PLAN.md` § Zero-dollar constraint). Deferred: this pass wires all integrations against `.env.example` placeholders without connecting live accounts — see `ARCHITECTURE.md` for what's still unconnected.

## Out of scope for v1

- Native mobile SDKs (web JS snippet only).
- Paid integrations of any kind (Zendesk/Productboard connectors are explicitly CSV-import-based, not live API integrations, to stay on free tiers).
- Enterprise SSO/SAML — Supabase Auth's free tier covers email/password only for this pass.
