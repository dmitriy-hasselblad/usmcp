-- Structured hiring details let employers communicate eligibility and mobility
-- without putting sensitive or misleading immigration promises into free text.
alter table public.jobs
  add column employment_arrangement text not null default 'Not specified'
    check (employment_arrangement in (
      'Not specified', 'W-2 direct hire', '1099 independent contractor',
      'Agency placement', 'Other'
    )),
  add column new_graduates_welcome boolean not null default false,
  add column licensure_requirement text not null default 'Not specified'
    check (licensure_requirement in (
      'Not specified', 'Active state license required',
      'Eligible to obtain a state license', 'Compact license preferred'
    )),
  add column care_settings text[] not null default '{}'
    check (
      cardinality(care_settings) <= 8
      and care_settings <@ array[
        'Acute care', 'Ambulatory / outpatient', 'Rehabilitation', 'Home health',
        'Long-term care', 'Behavioral health', 'Academic / research', 'Telehealth'
      ]::text[]
    ),
  add column relocation_support text not null default 'Not offered'
    check (relocation_support in ('Not offered', 'May be available', 'Available')),
  add column visa_sponsorship_status text not null default 'Not offered'
    check (visa_sponsorship_status in ('Not offered', 'May be considered', 'Available')),
  add column visa_pathways text[] not null default '{}'
    check (
      cardinality(visa_pathways) <= 3
      and visa_pathways <@ array[
        'H-1B', 'Employment-based permanent residence', 'Other'
      ]::text[]
    ),
  add constraint jobs_visa_pathways_require_sponsorship
    check (visa_sponsorship_status <> 'Not offered' or cardinality(visa_pathways) = 0);

grant select (
  employment_arrangement, new_graduates_welcome, licensure_requirement,
  care_settings, relocation_support, visa_sponsorship_status, visa_pathways
) on table public.jobs to anon, authenticated;

grant insert (
  employment_arrangement, new_graduates_welcome, licensure_requirement,
  care_settings, relocation_support, visa_sponsorship_status, visa_pathways
) on table public.jobs to authenticated;

-- PostgreSQL does not permit inserting columns into the middle of an existing
-- view with CREATE OR REPLACE, so rebuild this standalone public view inside
-- the migration transaction.
drop view public.published_jobs;

create or replace view public.published_jobs
with (security_invoker = true)
as
select
  jobs.id, jobs.slug, jobs.title, jobs.specialty, jobs.city, jobs.state_code,
  jobs.employment_type, jobs.workplace_type, jobs.salary_min, jobs.salary_max,
  jobs.salary_period, jobs.visa_support, jobs.employment_arrangement,
  jobs.new_graduates_welcome, jobs.licensure_requirement, jobs.care_settings,
  jobs.relocation_support, jobs.visa_sponsorship_status, jobs.visa_pathways,
  jobs.description, jobs.published_at, jobs.created_at,
  organizations.id as organization_id, organizations.name as organization_name,
  organizations.slug as organization_slug, organizations.organization_type,
  organizations.state_code as organization_state_code,
  organizations.description as organization_description,
  organizations.website as organization_website, organizations.verification_status,
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
grant select on table public.published_jobs to anon, authenticated;
