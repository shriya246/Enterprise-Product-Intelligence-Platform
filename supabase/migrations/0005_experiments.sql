-- Feature flags (org-scoped, optional percentage rollout) and lightweight
-- A/B experiments with manually-recorded variant counts. Significance is
-- computed in the application layer (src/lib/stats/ab-test.ts) with
-- simple-statistics rather than a paid experimentation platform.

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_enabled boolean not null default false,
  rollout_pct smallint not null default 100 check (rollout_pct between 0 and 100),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

alter table public.feature_flags enable row level security;

create policy "members can read org feature flags"
  on public.feature_flags for select
  using (public.is_org_member(org_id));

create policy "admins can manage org feature flags"
  on public.feature_flags for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  variant_a_name text not null default 'A',
  variant_b_name text not null default 'B',
  visitors_a integer not null default 0,
  conversions_a integer not null default 0,
  visitors_b integer not null default 0,
  conversions_b integer not null default 0,
  p_value numeric,
  is_significant boolean,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiments enable row level security;

create policy "members can read org experiments"
  on public.experiments for select
  using (public.is_org_member(org_id));

create policy "members can manage org experiments"
  on public.experiments for all
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
