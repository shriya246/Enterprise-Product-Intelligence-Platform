-- Idempotent reset of every RLS policy defined across 0001-0006.
--
-- Root cause: when the original migrations were pasted into the Supabase
-- SQL Editor, at least one policy ("authenticated users can create orgs" on
-- organizations) never actually got created, even though every table,
-- function, and trigger did — confirmed live via a raw PostgREST insert
-- that failed with 42501 despite a fully valid JWT (role=authenticated,
-- sub matching created_by exactly). Rather than patch that one policy and
-- risk the same silent gap elsewhere, this drops (if present) and
-- re-creates every policy from scratch so the live database's RLS state is
-- guaranteed to match what's in this repo.
--
-- Safe to re-run any number of times.

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles are readable by self" on public.profiles;
create policy "profiles are readable by self"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles are editable by self" on public.profiles;
create policy "profiles are editable by self"
  on public.profiles for update
  using (id = auth.uid());

drop policy if exists "profiles are readable by org co-members" on public.profiles;
create policy "profiles are readable by org co-members"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.org_members mine
      join public.org_members theirs on theirs.org_id = mine.org_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
  );

-- organizations ---------------------------------------------------------------
drop policy if exists "org members can read their orgs" on public.organizations;
create policy "org members can read their orgs"
  on public.organizations for select
  using (public.is_org_member(id));

drop policy if exists "authenticated users can create orgs" on public.organizations;
create policy "authenticated users can create orgs"
  on public.organizations for insert
  with check (created_by = auth.uid());

drop policy if exists "owners/admins can update their org" on public.organizations;
create policy "owners/admins can update their org"
  on public.organizations for update
  using (public.is_org_admin(id));

-- org_members -----------------------------------------------------------------
drop policy if exists "members can read org membership" on public.org_members;
create policy "members can read org membership"
  on public.org_members for select
  using (public.is_org_member(org_id));

drop policy if exists "admins can manage org membership" on public.org_members;
create policy "admins can manage org membership"
  on public.org_members for insert
  with check (public.is_org_admin(org_id) or not exists (
    select 1 from public.org_members where org_id = org_members.org_id
  ));

drop policy if exists "admins can update org membership" on public.org_members;
create policy "admins can update org membership"
  on public.org_members for update
  using (public.is_org_admin(org_id));

drop policy if exists "admins can remove org membership" on public.org_members;
create policy "admins can remove org membership"
  on public.org_members for delete
  using (public.is_org_admin(org_id));

-- audit_log ---------------------------------------------------------------------
drop policy if exists "admins can read audit log" on public.audit_log;
create policy "admins can read audit log"
  on public.audit_log for select
  using (public.is_org_admin(org_id));

drop policy if exists "members can write audit log entries" on public.audit_log;
create policy "members can write audit log entries"
  on public.audit_log for insert
  with check (public.is_org_member(org_id) and actor_id = auth.uid());

-- events --------------------------------------------------------------------------
drop policy if exists "members can read org events" on public.events;
create policy "members can read org events"
  on public.events for select
  using (public.is_org_member(org_id));

-- features ------------------------------------------------------------------------
drop policy if exists "members can read org features" on public.features;
create policy "members can read org features"
  on public.features for select
  using (public.is_org_member(org_id));

drop policy if exists "admins can manage org features" on public.features;
create policy "admins can manage org features"
  on public.features for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- feedback_items ------------------------------------------------------------------
drop policy if exists "members can read org feedback" on public.feedback_items;
create policy "members can read org feedback"
  on public.feedback_items for select
  using (public.is_org_member(org_id));

drop policy if exists "members can add org feedback" on public.feedback_items;
create policy "members can add org feedback"
  on public.feedback_items for insert
  with check (public.is_org_member(org_id));

drop policy if exists "admins can manage org feedback" on public.feedback_items;
create policy "admins can manage org feedback"
  on public.feedback_items for update
  using (public.is_org_admin(org_id));

drop policy if exists "admins can delete org feedback" on public.feedback_items;
create policy "admins can delete org feedback"
  on public.feedback_items for delete
  using (public.is_org_admin(org_id));

-- roadmap_items ---------------------------------------------------------------------
drop policy if exists "members can read org roadmap items" on public.roadmap_items;
create policy "members can read org roadmap items"
  on public.roadmap_items for select
  using (public.is_org_member(org_id));

drop policy if exists "members can create org roadmap items" on public.roadmap_items;
create policy "members can create org roadmap items"
  on public.roadmap_items for insert
  with check (public.is_org_member(org_id));

drop policy if exists "members can update org roadmap items" on public.roadmap_items;
create policy "members can update org roadmap items"
  on public.roadmap_items for update
  using (public.is_org_member(org_id));

drop policy if exists "admins can delete org roadmap items" on public.roadmap_items;
create policy "admins can delete org roadmap items"
  on public.roadmap_items for delete
  using (public.is_org_admin(org_id));

-- roadmap_item_dependencies ----------------------------------------------------------
drop policy if exists "members can read org roadmap dependencies" on public.roadmap_item_dependencies;
create policy "members can read org roadmap dependencies"
  on public.roadmap_item_dependencies for select
  using (public.is_org_member(org_id));

drop policy if exists "members can manage org roadmap dependencies" on public.roadmap_item_dependencies;
create policy "members can manage org roadmap dependencies"
  on public.roadmap_item_dependencies for all
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

-- prd_drafts ----------------------------------------------------------------------------
drop policy if exists "members can read org prd drafts" on public.prd_drafts;
create policy "members can read org prd drafts"
  on public.prd_drafts for select
  using (public.is_org_member(org_id));

drop policy if exists "members can create org prd drafts" on public.prd_drafts;
create policy "members can create org prd drafts"
  on public.prd_drafts for insert
  with check (public.is_org_member(org_id));

-- feature_flags ---------------------------------------------------------------------------
drop policy if exists "members can read org feature flags" on public.feature_flags;
create policy "members can read org feature flags"
  on public.feature_flags for select
  using (public.is_org_member(org_id));

drop policy if exists "admins can manage org feature flags" on public.feature_flags;
create policy "admins can manage org feature flags"
  on public.feature_flags for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- experiments -----------------------------------------------------------------------------
drop policy if exists "members can read org experiments" on public.experiments;
create policy "members can read org experiments"
  on public.experiments for select
  using (public.is_org_member(org_id));

drop policy if exists "members can manage org experiments" on public.experiments;
create policy "members can manage org experiments"
  on public.experiments for all
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
