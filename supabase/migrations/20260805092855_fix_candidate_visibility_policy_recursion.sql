-- Avoid the profiles -> professional_profiles -> profiles RLS recursion that
-- blocked professionals from changing their discovery visibility.

create or replace function private.can_discover_professional(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.professional_profiles
      where professional_profiles.user_id = target_user_id
        and professional_profiles.profile_visibility = 'employer_search'
    )
    and exists (
      select 1
      from public.organization_members
      where organization_members.user_id = (select auth.uid())
    );
$$;

revoke all on function private.can_discover_professional(uuid)
from public, anon, authenticated;
grant execute on function private.can_discover_professional(uuid)
to authenticated;

drop policy "Employer members can read discoverable profile names"
on public.profiles;

create policy "Employer members can read discoverable profile names"
on public.profiles
for select
to authenticated
using (private.can_discover_professional(id));
