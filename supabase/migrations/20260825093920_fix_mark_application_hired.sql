-- Fix the qualified column returned by the original hiring RPC.  The function
-- has an output column named `updated_at`, so PostgreSQL otherwise treats the
-- RETURNING reference as ambiguous.
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
    applications.organization_id, applications.job_id, applications.status,
    jobs.status, jobs.open_positions, applications.candidate_email,
    applications.candidate_first_name, applications.candidate_last_name,
    applications.job_title, applications.organization_name
  into
    target_organization_id, target_job_id, current_application_status,
    current_job_status, current_open_positions, result_candidate_email,
    result_candidate_first_name, result_candidate_last_name, result_job_title,
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
  returning public.applications.updated_at into result_updated_at;

  update public.jobs
  set open_positions = next_open_positions,
      status = case when next_open_positions = 0 then 'closed'::public.job_status else status end
  where id = target_job_id;

  return query
  select target_application_id, result_candidate_email, result_candidate_first_name,
    result_candidate_last_name, result_job_title, result_organization_name,
    result_updated_at, next_open_positions, next_open_positions = 0;
end;
$$;

revoke all on function public.mark_application_hired(uuid) from public, anon;
grant execute on function public.mark_application_hired(uuid) to authenticated;
