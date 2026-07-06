# Go-to-Market Strategy

## Positioning

PulseAI is the AI-first alternative to running Mixpanel + Productboard + a chat AI tab side by side. The wedge is consolidation: teams already pay for (or juggle free tiers of) two or three tools to do what PulseAI does in one workspace, with an AI layer that reasons over the combined data rather than a separate chat tab that has to be told everything by hand.

## Target segment for launch

Early-stage and small product teams (seed to Series B, 1-5 person product org) who are currently either under-tooled (spreadsheets + a free Mixpanel tier) or over-tooled (three separate subscriptions they resent paying for). This segment is price-sensitive and values a single login over best-in-class depth in any one category — exactly PulseAI's tradeoff.

Explicitly not the initial target: enterprise buyers who need SSO/SAML, dedicated support SLAs, or deep customization — those are V2+ concerns per `ROADMAP.md`.

## Launch motion

**Self-serve, product-led.** No sales team at this stage — the product has to sell itself in the time it takes to sign up, drop in the tracking snippet, and see the first DAU number populate. This is why Sprint 1's "done" criteria was explicitly the signup-to-first-dashboard loop working end to end, not a feature checklist.

## Channels

1. **Direct outreach in PM communities** (where PMs already discuss tool fatigue) — the pitch is the consolidation story, not a feature list.
2. **Content built from the product itself** — e.g. "we used our own AI assistant to analyze our own beta users' retention," which doubles as a dogfooding proof point and marketing content.
3. **Comparison content** against Mixpanel/Productboard/Pendo, drawing directly from `COMPETITIVE_ANALYSIS.md` — this is the kind of content a price-sensitive, tool-fatigued buyer searches for.

## Launch sequence

1. Private beta with a handful of design partners who fit the target segment, recruited directly rather than through paid acquisition.
2. Iterate on the AI assistant and PRD generator based on real usage — these are the two features hardest to get right without real user language patterns.
3. Public launch once the full loop (`PRD.md`'s v1 scope) is demoable end-to-end on a live account, not just in the codebase.

## What "success" looks like at launch

Tied to `KPI_FRAMEWORK.md`'s North Star (Weekly Insight Actions): a design partner asking the AI assistant a real question and getting an answer they act on, without a PulseAI team member walking them through it.
