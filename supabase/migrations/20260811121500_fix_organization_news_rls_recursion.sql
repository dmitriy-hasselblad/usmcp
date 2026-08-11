-- Break the organizations <-> organization_posts RLS policy cycle.

create or replace function private.has_public_organization_news(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_posts
    where organization_id = target_organization_id
      and status = 'published'
      and moderation_status = 'approved'
  );
$$;

revoke all on function private.has_public_organization_news(uuid) from public, anon, authenticated;
grant usage on schema private to anon;
grant execute on function private.has_public_organization_news(uuid) to anon, authenticated;

drop policy "Anonymous can read public organizations" on public.organizations;
create policy "Anonymous can read public organizations"
on public.organizations for select to anon
using (
  exists (select 1 from public.jobs where jobs.organization_id = organizations.id and jobs.status = 'published' and jobs.moderation_status = 'approved')
  or (organizations.verification_status = 'verified' and private.has_public_organization_news(id))
);

drop policy "Authenticated users can read available organizations" on public.organizations;
create policy "Authenticated users can read available organizations"
on public.organizations for select to authenticated
using (
  created_by = (select auth.uid())
  or private.is_organization_member(id)
  or exists (select 1 from public.jobs where jobs.organization_id = organizations.id and jobs.status = 'published' and jobs.moderation_status = 'approved')
  or (organizations.verification_status = 'verified' and private.has_public_organization_news(id))
);
