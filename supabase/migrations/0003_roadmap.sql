-- Roadmap module: items with status/timeline, dependencies between items,
-- and AI-assisted prioritization fields populated by the Groq-backed
-- prioritization endpoint.

create type public.roadmap_status as enum ('backlog', 'planned', 'in_progress', 'shipped');

create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  status public.roadmap_status not null default 'backlog',
  target_quarter text,
  linked_feature_id uuid references public.features (id) on delete set null,
  priority_score numeric,
  priority_rationale text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roadmap_items_org_status_idx on public.roadmap_items (org_id, status);

alter table public.roadmap_items enable row level security;

create policy "members can read org roadmap items"
  on public.roadmap_items for select
  using (public.is_org_member(org_id));

create policy "members can create org roadmap items"
  on public.roadmap_items for insert
  with check (public.is_org_member(org_id));

create policy "members can update org roadmap items"
  on public.roadmap_items for update
  using (public.is_org_member(org_id));

create policy "admins can delete org roadmap items"
  on public.roadmap_items for delete
  using (public.is_org_admin(org_id));

create table if not exists public.roadmap_item_dependencies (
  roadmap_item_id uuid not null references public.roadmap_items (id) on delete cascade,
  depends_on_item_id uuid not null references public.roadmap_items (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (roadmap_item_id, depends_on_item_id),
  check (roadmap_item_id <> depends_on_item_id)
);

alter table public.roadmap_item_dependencies enable row level security;

create policy "members can read org roadmap dependencies"
  on public.roadmap_item_dependencies for select
  using (public.is_org_member(org_id));

create policy "members can manage org roadmap dependencies"
  on public.roadmap_item_dependencies for all
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
