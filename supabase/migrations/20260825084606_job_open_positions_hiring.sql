-- Employers publish the number of real vacancies attached to a job.  The
-- count is decremented only through the guarded hiring RPC below.
alter table public.jobs
add column open_positions smallint not null default 1
check (open_positions between 0 and 250);

grant select (open_positions) on table public.jobs to anon, authenticated;
grant insert (open_positions) on table public.jobs to authenticated;

alter type public.application_status add value if not exists 'hired';

-- A hiring decision changes two records.  Keep those changes in one locked
-- transaction so two team members cannot consume the same opening.
create or replace function public.mark_application_hired(target_application_id uuid)
returns table (
  application_id uuid,
  candidate_email text,
  candidate_first_name text,
  candidate_last_name text,
  job_title text,
  organization_name text,
  updated_at timestamptz,
  remaining_open_positions smallint,
  job_closed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_organization_id uuid;
  target_job_id uuid;
  current_application_status public.application_status;
  current_job_status public.job_status;
  current_open_positions smallint;
  result_candidate_email text;
  result_candidate_first_name text;
  result_candidate_last_name text;
  result_job_title text;
  result_organization_name text;
  result_updated_at timestamptz;
  next_open_positions smallint;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to record a hiring decision.';
  end if;

  select
    applications.organization_id,
    applications.job_id,
    applications.status,
    jobs.status,
    jobs.open_positions,
    applications.candidate_email,
    applications.candidate_first_name,
    applications.candidate_last_name,
    applications.job_title,
    applications.organization_name
  into
    target_organization_id,
    target_job_id,
    current_application_status,
    current_job_status,
    current_open_positions,
    result_candidate_email,
    result_candidate_first_name,
    result_candidate_last_name,
    result_job_title,
    result_organization_name
  from public.applications
  join public.jobs on jobs.id = applications.job_id
  where applications.id = target_application_id
  for update of applications, jobs;

  if not found then
    raise exception 'This application is unavailable.';
  end if;

  if not private.is_organization_member(
    target_organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  ) then
    raise exception 'Your workspace role cannot record a hiring decision.';
  end if;

  if current_application_status in ('withdrawn', 'rejected', 'hired') then
    raise exception 'This application is no longer eligible to be marked as hired.';
  end if;

  if current_job_status not in ('published', 'paused') or current_open_positions < 1 then
    raise exception 'This job has no open positions remaining.';
  end if;

  next_open_positions := current_open_positions - 1;

  update public.applications
  set status = 'hired'::public.application_status,
      updated_at = now()
  where id = target_application_id
  returning updated_at into result_updated_at;

  update public.jobs
  set open_positions = next_open_positions,
      status = case when next_open_positions = 0 then 'closed'::public.job_status else status end
  where id = target_job_id;

  return query
  select
    target_application_id,
    result_candidate_email,
    result_candidate_first_name,
    result_candidate_last_name,
    result_job_title,
    result_organization_name,
    result_updated_at,
    next_open_positions,
    next_open_positions = 0;
end;
$$;

revoke all on function public.mark_application_hired(uuid) from public, anon;
grant execute on function public.mark_application_hired(uuid) to authenticated;

-- Do not let a zero-opening job remain visible or accept crafted applications.
drop policy if exists "Anonymous can read active approved published jobs" on public.jobs;
create policy "Anonymous can read active approved published jobs"
on public.jobs for select to anon
using (
  status = 'published'
  and moderation_status = 'approved'
  and expires_at > now()
  and open_positions > 0
);

drop policy if exists "Authenticated users can read active jobs" on public.jobs;
create policy "Authenticated users can read active jobs"
on public.jobs for select to authenticated
using (
  (status = 'published'
    and moderation_status = 'approved'
    and expires_at > now()
    and open_positions > 0)
  or private.is_organization_member(organization_id)
);

create or replace function private.prepare_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null or new.candidate_id <> current_user_id then
    raise exception 'A candidate can only submit their own application.';
  end if;

  select profiles.first_name, profiles.last_name, auth_users.email,
    professional_profiles.profession, professional_profiles.specialty,
    professional_profiles.career_stage, professional_profiles.state_code
  into new.candidate_first_name, new.candidate_last_name, new.candidate_email,
    new.profession, new.specialty, new.career_stage, new.state_code
  from public.profiles
  join public.professional_profiles on professional_profiles.user_id = profiles.id
  join auth.users as auth_users on auth_users.id = profiles.id
  where profiles.id = current_user_id
    and profiles.account_type = 'professional'
    and profiles.onboarding_completed
    and profiles.first_name is not null
    and profiles.last_name is not null
    and auth_users.email is not null;

  if not found then
    raise exception 'A completed professional profile is required.';
  end if;

  select jobs.organization_id, jobs.slug, jobs.title, organizations.name
  into new.organization_id, new.job_slug, new.job_title, new.organization_name
  from public.jobs
  join public.organizations on organizations.id = jobs.organization_id
  where jobs.id = new.job_id
    and jobs.status = 'published'
    and jobs.moderation_status = 'approved'
    and jobs.expires_at > now()
    and jobs.open_positions > 0;

  if not found then
    raise exception 'This job is not accepting applications.';
  end if;

  new.status := 'submitted'::public.application_status;
  new.submitted_at := now();
  new.updated_at := now();
  return new;
end;
$$;

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
  jobs.profession, jobs.experience_level, jobs.required_skills, jobs.expires_at,
  jobs.open_positions
from public.jobs
join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published'
  and jobs.moderation_status = 'approved'
  and jobs.expires_at > now()
  and jobs.open_positions > 0;

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
