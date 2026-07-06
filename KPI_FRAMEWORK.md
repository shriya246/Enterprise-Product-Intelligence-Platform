# KPI Framework

## North Star Metric

**Weekly Insight Actions** — the number of times per week a user in an org takes an action that turns data into a decision: asking the AI assistant a question, building a funnel, generating a PRD from a feature idea, or accepting an AI-recommended roadmap priority.

This is the North Star rather than a raw usage metric (like DAU) because PulseAI's value isn't time-on-page — it's collapsing the "gather data → get insight → decide" loop. A PM opening the tool and immediately getting an answer, then leaving, is the product working as intended.

## Supporting KPIs

### Activation
- **Time to first event received** — from org creation to the first event landing via the SDK. Target: under 10 minutes for a technical user following the snippet.
- **Time to first AI assistant question** — from org creation to first chat query. Signals whether the AI layer is being discovered.

### Engagement
- **DAU/WAU/MAU** (of the PulseAI workspace itself, not the customer's product) — standard stickiness ratio (DAU/MAU) as a proxy for habitual use.
- **Feedback items processed per org per week** — manual entries + CSV import rows, a proxy for whether feedback intelligence is a real workflow or a one-time trial.
- **Roadmap items with AI-assisted prioritization accepted** — measures whether the AI recommendation is trusted enough to act on, not just viewed.

### Retention
- **Week-4 org retention** — percentage of orgs still sending events or logging in four weeks after creation. The clearest signal of whether PulseAI became the team's system of record versus a one-time evaluation.
- **Weekly cohort retention curve** (rendered in-product on the analytics dashboard itself — PulseAI is a dogfood case of its own retention chart).

### AI quality (leading indicator, not vanity)
- **AI assistant answer acceptance rate** — thumbs-up/down or implicit "did the user ask a follow-up vs. abandon" signal on chat answers.
- **PRD draft edit distance** — how much a generated PRD draft gets rewritten before use; a proxy for whether the generator is saving real drafting time or just producing a starting point that gets discarded.

## Reporting cadence

KPIs are reviewed at the end of each sprint/pass alongside `EXECUTIVE_SUMMARY.md`. This is a draft framework for MVP — instrumentation for the "AI quality" tier depends on chat and PRD generator usage data that will only exist once those features are live and connected to a real Groq account.
