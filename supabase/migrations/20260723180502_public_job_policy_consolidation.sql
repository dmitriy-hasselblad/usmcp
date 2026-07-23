-- Consolidate public and member SELECT access into one policy per role.

drop policy if exists "Members can read organization jobs"
on public.jobs;

drop policy if exists "Anyone can read published jobs"
on public.jobs;

drop policy if exists "Anonymous can read published jobs"
on public.jobs;

drop policy if exists "Authenticated users can read available jobs"
on public.jobs;

drop policy if exists "Members can read their organization"
on public.organizations;

drop policy if exists "Published job organizations are public"
on public.organizations;

drop policy if exists "Anonymous can read published job organizations"
on public.organizations;

drop policy if exists "Authenticated users can read available organizations"
on public.organizations;

create policy "Anonymous can read published jobs"
on public.jobs
for select
to anon
using (status = 'published');

create policy "Authenticated users can read available jobs"
on public.jobs
for select
to authenticated
using (
  status = 'published'
  or private.is_organization_member(organization_id)
);

create policy "Anonymous can read published job organizations"
on public.organizations
for select
to anon
using (
  exists (
    select 1
    from public.jobs
    where jobs.organization_id = organizations.id
      and jobs.status = 'published'
  )
);

create policy "Authenticated users can read available organizations"
on public.organizations
for select
to authenticated
using (
  private.is_organization_member(id)
  or exists (
    select 1
    from public.jobs
    where jobs.organization_id = organizations.id
      and jobs.status = 'published'
  )
);
