-- Stores AI-generated PRD drafts so a generation isn't lost the moment the
-- user navigates away, and so past drafts can be browsed later.

create table if not exists public.prd_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  feature_idea text not null,
  title text not null,
  user_stories jsonb not null default '[]'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  success_metrics jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists prd_drafts_org_created_idx on public.prd_drafts (org_id, created_at desc);

alter table public.prd_drafts enable row level security;

create policy "members can read org prd drafts"
  on public.prd_drafts for select
  using (public.is_org_member(org_id));

create policy "members can create org prd drafts"
  on public.prd_drafts for insert
  with check (public.is_org_member(org_id));
