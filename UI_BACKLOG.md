# UI/UX Redesign Backlog

Living checklist for the redesign pass. One page or reusable component per item, each sized as a single shippable commit. Checked off as shipped and pushed.

## Audit summary (current state before this pass)

- No design system: default Arial font, plain black/white theme, no color tokens beyond `--background`/`--foreground`, no icon library, no animation library.
- No landing page — `/` just redirects straight to `/login` or `/onboarding`.
- Auth pages (`/login`, `/signup`) and `/onboarding` are plain unstyled forms.
- Dashboard app shell (`org/[slug]/layout.tsx`) is a bare sidebar list, no top nav, no org switcher, no search, no user menu, no mobile drawer.
- One combined `dashboard` page does DAU/WAU/MAU + retention + funnel + cohort heatmap + feature adoption all on a single page — plan calls for these split into Overview / Analytics / Funnels / Cohorts as separate nav items and pages.
- `feedback` page has manual entry + CSV import + a flat list with sentiment/theme tags, but no dedicated themes/clusters view, no severity indicator, no detail drawer.
- `chat`, `roadmap`, `prd-generator`, `experiments`, `executive` pages are all functional but plain-HTML styled — no cards, no charts-as-cards, no status/priority badges, no animation.
- `settings` page has member management but no API Keys / write-key display anywhere in the UI at all (a real functional gap, not just cosmetic — there's currently no way to find your SDK write key without querying the database directly).
- No reusable component library — every page hand-rolls its own `<div className="rounded-lg border ...">` cards.

## Foundation (must land before individual pages)

- [x] Design system setup: Tailwind theme tokens (color scale, radii, shadows), Inter font via `next/font/google`, install `framer-motion` + `lucide-react`, refresh `globals.css`
- [x] Reusable components: `AppShell`, `Sidebar` (with active-indicator animation + mobile drawer), `TopNav` (org switcher, command search, notifications, user menu) — also required splitting the old merged dashboard into Overview/Analytics/Funnels/Cohorts routes to match the sidebar IA
- [x] Reusable components: `MetricCard`, `ChartCard`, `InsightCard`, `AnimatedCard`
- [x] Reusable components: `StatusBadge`, `PriorityBadge`, `EmptyState`, `LoadingSkeleton`, `PageHeader`, `SectionHeader`
- [x] Reusable components: `CommandSearch` (shipped with TopNav), `AIMessage`, `PromptChip`, `ExecutiveSummaryCard`

## Pages

- [x] Landing page (new — hero, trust section, features, workflow diagram, dashboard preview, final CTA)
- [x] Login + signup pages redesign
- [x] Onboarding page redesign (create/select org)
- [x] Overview page (new — replaces old catch-all dashboard as the post-login landing screen: KPI snapshot + AI insight callout + quick links)
- [x] Analytics page (KPI cards w/ sparklines, DAU trend chart, top events table, feature adoption — date range/segment filters and export placeholder deferred, noted as known limitation)
- [x] Funnels page (new, split out of old dashboard — funnel builder as its own page)
- [x] Cohorts page (new, split out of old dashboard — cohort heatmap as its own page)
- [x] Feedback page redesign (source/sentiment filters, sentiment badges, AI summary panel — customer segment filter deferred, no segment data model exists yet)
- [x] Feedback themes page (new — theme cards, clusters, severity indicator, detail drawer)
- [x] AI Assistant page redesign (message bubbles, prompt chips, evidence cards, streaming effect, empty state — confidence badge deferred, no real confidence signal exists to show without fabricating one)
- [x] Roadmap page redesign (kanban + status/priority badges, AI recommendation card, dependency indicator — detail modal deferred, cards already show full detail inline)
- [ ] PRD Generator page redesign (persona/business-goal inputs, related feedback selector, PRD preview, copy-Markdown, quality checklist)
- [ ] Experiments page redesign (flag cards w/ rollout slider, A/B variant comparison, confidence indicator, kill switch)
- [ ] Executive Dashboard redesign (health score, KPI grid, AI summary, risks/opportunities, presentation-ready layout)
- [ ] Settings page redesign + new API Keys tab (surfaces the org write_key + SDK snippet — closes the functional gap noted above)

## Cross-cutting (verified per-page as each ships, not a separate commit)

- Responsive behavior (mobile sidebar drawer, breakpoints) checked on every page as it's redesigned
- Realistic demo content (no Lorem ipsum) on every page
- Lint + build clean before checking a page done
