-- Publish employer-approved jobs through a limited, read-only marketplace view.

alter table public.jobs
add column slug text;

update public.jobs
set slug =
  coalesce(
    nullif(
      trim(
        both '-' from regexp_replace(
          lower(title),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ),
      ''
    ),
    'healthcare-job'
  ) || '-' || left(id::text, 8);

alter table public.jobs
alter column slug set not null;

alter table public.jobs
add constraint jobs_slug_format_check check (
  char_length(slug) between 3 and 180
  and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
);

alter table public.jobs
add constraint jobs_slug_key unique (slug);

create index jobs_published_at_idx
on public.jobs (published_at desc)
where status = 'published';

drop policy "Members can read organization jobs"
on public.jobs;

drop policy "Members can read their organization"
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

grant select (
  id,
  organization_id,
  slug,
  title,
  specialty,
  city,
  state_code,
  employment_type,
  workplace_type,
  salary_min,
  salary_max,
  salary_period,
  visa_support,
  description,
  status,
  published_at,
  created_at,
  updated_at
) on table public.jobs to anon;

grant select (
  id,
  name,
  slug,
  organization_type,
  state_code,
  description,
  website,
  verification_status,
  created_at,
  updated_at
) on table public.organizations to anon;

grant insert (slug)
on table public.jobs
to authenticated;

create view public.published_jobs
with (security_invoker = true)
as
select
  jobs.id,
  jobs.slug,
  jobs.title,
  jobs.specialty,
  jobs.city,
  jobs.state_code,
  jobs.employment_type,
  jobs.workplace_type,
  jobs.salary_min,
  jobs.salary_max,
  jobs.salary_period,
  jobs.visa_support,
  jobs.description,
  jobs.published_at,
  jobs.created_at,
  organizations.id as organization_id,
  organizations.name as organization_name,
  organizations.slug as organization_slug,
  organizations.organization_type,
  organizations.state_code as organization_state_code,
  organizations.description as organization_description,
  organizations.website as organization_website,
  organizations.verification_status
from public.jobs
join public.organizations
  on organizations.id = jobs.organization_id
where jobs.status = 'published';

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
