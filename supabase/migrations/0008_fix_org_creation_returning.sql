-- Root cause of the persistent "new row violates row-level security policy
-- for table organizations" error: our org-creation code does
-- `insert ... returning id, slug`, and Postgres requires the table's SELECT
-- policy (not just the INSERT policy) to permit visibility of the returned
-- row. At creation time the creator isn't in org_members yet (that insert
-- happens as a second, separate step right after), so the original SELECT
-- policy (`is_org_member(id)`) denied visibility of the brand-new row and
-- Postgres reported that as the same generic RLS violation on the insert.
--
-- Confirmed live: auth.uid() resolves correctly and a bare insert (no
-- returning) would have satisfied the INSERT policy's with-check — the
-- RETURNING clause was the actual blocker.

drop policy if exists "org members can read their orgs" on public.organizations;
create policy "org members can read their orgs"
  on public.organizations for select
  using (public.is_org_member(id) or created_by = auth.uid());
