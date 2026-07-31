-- Add the structured marketplace fields required by the Blueprint job filters.

alter table public.jobs
add column profession text not null default 'Other Healthcare Professional'
check (
  profession in (
    'Physician',
    'Registered Nurse',
    'Advanced Practice Provider',
    'Pharmacist',
    'Therapist',
    'Technologist or Technician',
    'Healthcare Administration',
    'Other Healthcare Professional'
  )
),
add column experience_level text not null default 'Not specified'
check (
  experience_level in (
    'Entry level',
    'Mid level',
    'Senior level',
    'Executive',
    'Not specified'
  )
);

grant insert (profession, experience_level)
on table public.jobs
to authenticated;

grant update (profession, experience_level)
on table public.jobs
to authenticated;

grant select (profession, experience_level)
on table public.jobs
to anon;

create or replace view public.published_jobs
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
  organizations.verification_status,
  jobs.profession,
  jobs.experience_level
from public.jobs
join public.organizations
  on organizations.id = jobs.organization_id
where jobs.status = 'published';

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
