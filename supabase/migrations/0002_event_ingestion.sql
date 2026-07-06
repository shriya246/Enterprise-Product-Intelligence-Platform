-- Adds a per-org public write key so the SDK snippet can identify which
-- org an event belongs to without requiring a signed-in session (same
-- token model as PostHog/Mixpanel client-side SDKs).

alter table public.organizations
  add column if not exists write_key uuid not null default gen_random_uuid() unique;
