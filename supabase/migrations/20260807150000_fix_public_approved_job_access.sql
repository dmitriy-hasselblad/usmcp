-- Keep the marketplace view security-invoker, while allowing guests to read
-- only the columns and rows required for approved, published opportunities.
-- The moderation column is referenced by public.published_jobs and therefore
-- must be readable by the anon role for the view to execute.

drop policy if exists "Anonymous can read published jobs"
on public.jobs;

create policy "Anonymous can read approved published jobs"
on public.jobs
for select
to anon
using (
  status = 'published'
  and moderation_status = 'approved'
);

drop policy if exists "Authenticated users can read available jobs"
on public.jobs;

create policy "Authenticated users can read available jobs"
on public.jobs
for select
to authenticated
using (
  (status = 'published' and moderation_status = 'approved')
  or private.is_organization_member(organization_id)
);

drop policy if exists "Anonymous can read published job organizations"
on public.organizations;

create policy "Anonymous can read approved job organizations"
on public.organizations
for select
to anon
using (
  exists (
    select 1
    from public.jobs
    where jobs.organization_id = organizations.id
      and jobs.status = 'published'
      and jobs.moderation_status = 'approved'
  )
);

drop policy if exists "Authenticated users can read available organizations"
on public.organizations;

create policy "Authenticated users can read available organizations"
on public.organizations
for select
to authenticated
using (
  created_by = (select auth.uid())
  or private.is_organization_member(id)
  or exists (
    select 1
    from public.jobs
    where jobs.organization_id = organizations.id
      and jobs.status = 'published'
      and jobs.moderation_status = 'approved'
  )
);

grant select (moderation_status)
on table public.jobs
to anon;
