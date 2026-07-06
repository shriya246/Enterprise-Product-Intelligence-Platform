# Pricing Strategy

## Guiding constraint

The entire stack runs on genuinely free infrastructure tiers (see `PROJECT_PLAN.md` § Zero-dollar constraint). That's an engineering decision for this build pass, but it also shapes pricing: PulseAI's cost to serve a small team is close to zero, which means the pricing strategy can lean generous at the low end without threatening margin the way it would for a tool paying per-seat for Mixpanel-scale infrastructure.

## Proposed tiers (post-MVP — not yet implemented; no billing code exists in this pass)

**Free** — the tier this build targets functionally. One organization, generous event volume (bounded by Supabase's free-tier Postgres storage, noted as a known limitation in `ARCHITECTURE.md`), full feature access (no feature-gating analytics vs. feedback vs. AI — the whole point is that it's unified). This is the tier that has to win on its own; PulseAI shouldn't cripple the free tier to force upgrades, because the entire pitch is "one free workspace instead of three."

**Team** — priced per seat, for orgs that outgrow the free tier's data volume or want more than one organization per account. Unlocks things that cost PulseAI real money at scale: higher event retention, more AI assistant queries per month (since Groq's free tier has real rate limits), priority support.

**What's deliberately not tiered:** the core loop (analytics + feedback + AI + roadmap + PRD + experiments) stays available at every tier. Segmenting it by feature would recreate the fragmentation problem PulseAI exists to solve — a team on the free tier shouldn't have feedback intelligence but not the AI assistant, for instance.

## Why not usage-based pricing at launch

Usage-based pricing (per-event, per-API-call) matches the underlying cost structure well, but it reintroduces the anxiety PMs already have with Mixpanel-style event-volume billing — one of the pains `PERSONAS.md` and `COMPETITIVE_ANALYSIS.md` call out. Flat per-seat pricing with a generous free tier is a simpler mental model for the target segment in `GTM_STRATEGY.md`, even if it's a slightly worse match to underlying infra cost.

## Open question for later

Whether the AI features (chat assistant, PRD generator, AI prioritization) eventually need separate rate limits or paid add-ons once real Groq usage patterns are known — Groq's free tier limits are generous today but untested at real scale. Flagged here rather than decided, since there's no usage data yet to decide from.
