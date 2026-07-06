# PulseAI — Executive Presentation

## The problem

Product teams run three tools to make one decision: an analytics tool for usage data, a feedback tool for the customer voice, and a roadmap tool for planning — with a chat AI tab on the side trying to make sense of all three. Stitching them together by hand costs hours per decision.

## The product

One workspace. Product data, customer feedback, and AI-generated insight live together, so a plain-English question like "why is retention dropping" gets answered from the org's own real data — not a guess.

## What's built (this pass)

- **Foundation:** multi-tenant orgs, role-based access, event ingestion SDK
- **Analytics:** DAU/WAU/MAU, retention curves, cohort heatmap, funnel builder, feature adoption
- **Feedback intelligence:** manual + CSV import, AI theme/sentiment clustering
- **AI assistant:** answers questions grounded in the org's real analytics and feedback
- **Roadmap:** items, dependencies, timeline, AI-recommended prioritization from real engagement + feedback signal
- **PRD generator:** feature idea → user stories, acceptance criteria, success metrics, risks
- **Experimentation:** feature flags with rollout percentage, A/B significance testing
- **Executive dashboard:** single-screen KPI rollup

## The full loop, end to end

Data in → AI insight → roadmap decision → PRD → experiment. Every stage is built; connecting live Supabase/Groq/Upstash accounts is the remaining step before a real demo (see `ARCHITECTURE.md`'s deferred-wiring note).

## Why this is defensible

Zero-dollar infrastructure (Supabase, Groq, Upstash, Vercel free tiers) means the cost to serve a small team is near zero — the free tier can stay genuinely generous, which is the whole pitch versus Mixpanel/Productboard/Pendo's paid-tier gating (see `COMPETITIVE_ANALYSIS.md`).

## What's next

Connect live accounts, run a private beta with a handful of design partners (see `GTM_STRATEGY.md`), and let the AI assistant and PRD generator prove themselves against real product questions, not synthetic ones.
