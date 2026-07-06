-- Org settings needs to list members with their email/name, but the original
-- profiles policy only let a user read their own row. Relax it to: readable
-- by yourself, or by anyone who shares at least one org with you.

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
