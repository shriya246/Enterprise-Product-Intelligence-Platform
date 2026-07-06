-- Core multi-tenant schema: organizations, membership/RBAC, audit log,
-- events, features, feedback_items. Every tenant-scoped table carries
-- org_id and is protected by RLS keyed off org membership.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users, holds display data Supabase Auth doesn't)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by self"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles are editable by self"
  on public.profiles for update
  using (id = auth.uid());

-- Auto-create a profile row whenever Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- ---------------------------------------------------------------------------
-- org_members (RBAC: owner / admin / member)
-- ---------------------------------------------------------------------------
create type public.org_role as enum ('owner', 'admin', 'member');

create table if not exists public.org_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.org_role not null default 'member',
  invited_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

alter table public.org_members enable row level security;

-- Helper: is the current user a member of the given org, and with what role.
create or replace function public.current_org_role(target_org uuid)
returns public.org_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.org_members
  where org_id = target_org and user_id = auth.uid();
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where org_id = target_org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where org_id = target_org and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create policy "org members can read their orgs"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "authenticated users can create orgs"
  on public.organizations for insert
  with check (created_by = auth.uid());

create policy "owners/admins can update their org"
  on public.organizations for update
  using (public.is_org_admin(id));

create policy "members can read org membership"
  on public.org_members for select
  using (public.is_org_member(org_id));

create policy "admins can manage org membership"
  on public.org_members for insert
  with check (public.is_org_admin(org_id) or not exists (
    select 1 from public.org_members where org_id = org_members.org_id
  ));

create policy "admins can update org membership"
  on public.org_members for update
  using (public.is_org_admin(org_id));

create policy "admins can remove org membership"
  on public.org_members for delete
  using (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- audit_log
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "admins can read audit log"
  on public.audit_log for select
  using (public.is_org_admin(org_id));

create policy "members can write audit log entries"
  on public.audit_log for insert
  with check (public.is_org_member(org_id) and actor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- events (product usage events ingested via the SDK)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  distinct_id text not null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists events_org_occurred_idx on public.events (org_id, occurred_at desc);
create index if not exists events_org_name_idx on public.events (org_id, event_name);
create index if not exists events_org_distinct_idx on public.events (org_id, distinct_id);

alter table public.events enable row level security;

create policy "members can read org events"
  on public.events for select
  using (public.is_org_member(org_id));

-- Inserts happen via the service-role ingestion API route, not directly from
-- the browser, so no public insert policy is granted here.

-- ---------------------------------------------------------------------------
-- features (product features tracked for adoption / roadmap linkage)
-- ---------------------------------------------------------------------------
create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

alter table public.features enable row level security;

create policy "members can read org features"
  on public.features for select
  using (public.is_org_member(org_id));

create policy "admins can manage org features"
  on public.features for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- feedback_items (manual entry + CSV import land here)
-- ---------------------------------------------------------------------------
create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  source text not null default 'manual',
  author text,
  body text not null,
  sentiment text,
  theme text,
  embedding vector(384),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists feedback_org_created_idx on public.feedback_items (org_id, created_at desc);

alter table public.feedback_items enable row level security;

create policy "members can read org feedback"
  on public.feedback_items for select
  using (public.is_org_member(org_id));

create policy "members can add org feedback"
  on public.feedback_items for insert
  with check (public.is_org_member(org_id));

create policy "admins can manage org feedback"
  on public.feedback_items for update
  using (public.is_org_admin(org_id));

create policy "admins can delete org feedback"
  on public.feedback_items for delete
  using (public.is_org_admin(org_id));
