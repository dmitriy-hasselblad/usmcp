alter table public.jobs
add column required_skills text[] not null default '{}'
check (cardinality(required_skills) <= 20);

grant select (required_skills) on table public.jobs to anon, authenticated;
grant insert (required_skills) on table public.jobs to authenticated;

create or replace view public.published_jobs
with (security_invoker = true)
as
select
  jobs.id, jobs.slug, jobs.title, jobs.specialty, jobs.city, jobs.state_code,
  jobs.employment_type, jobs.workplace_type, jobs.salary_min, jobs.salary_max,
  jobs.salary_period, jobs.visa_support, jobs.description, jobs.published_at,
  jobs.created_at, organizations.id as organization_id,
  organizations.name as organization_name, organizations.slug as organization_slug,
  organizations.organization_type, organizations.state_code as organization_state_code,
  organizations.description as organization_description,
  organizations.website as organization_website, organizations.verification_status,
  jobs.profession, jobs.experience_level, jobs.required_skills
from public.jobs join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published' and jobs.moderation_status = 'approved';

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
