alter table public.professional_profiles
  add column if not exists linkedin_url text
  check (linkedin_url is null or char_length(linkedin_url) <= 300);

alter table public.organizations
  add column if not exists linkedin_url text
  check (linkedin_url is null or char_length(linkedin_url) <= 300);

grant update (linkedin_url) on table public.professional_profiles to authenticated;
grant update (linkedin_url) on table public.organizations to authenticated;

alter table public.professional_resumes
  drop constraint if exists professional_resumes_template_key_check;

alter table public.professional_resumes
  add constraint professional_resumes_template_key_check
  check (template_key in (
    'us_healthcare_v1',
    'clinical_sidebar',
    'modern_blue_header',
    'executive_timeline',
    'accent_column',
    'two_column_professional',
    'classic_medical',
    'navy_sidebar'
  ));

alter table public.professional_resumes
  alter column template_key set default 'clinical_sidebar';

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
  organizations.website as organization_website,
  organizations.verification_status,
  jobs.profession, jobs.experience_level, jobs.required_skills, jobs.expires_at,
  jobs.open_positions, organizations.logo_path as organization_logo_path,
  organizations.linkedin_url as organization_linkedin_url
from public.jobs
join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published'
  and jobs.moderation_status = 'approved'
  and jobs.expires_at > now()
  and jobs.open_positions > 0;

revoke all on table public.published_jobs from public, anon, authenticated;
grant select (logo_path, linkedin_url) on table public.organizations to anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
