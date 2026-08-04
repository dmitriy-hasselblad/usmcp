-- Keep platform moderation separate from the employer-managed job lifecycle.

alter table public.jobs
add column moderation_status text not null default 'approved'
check (moderation_status in ('approved', 'under_review', 'blocked')),
add column moderation_reason text,
add column moderated_at timestamptz,
add column moderated_by uuid references auth.users (id) on delete set null;

create index jobs_moderation_status_created_at_idx
on public.jobs (moderation_status, created_at desc);

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
  jobs.profession, jobs.experience_level
from public.jobs
join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published' and jobs.moderation_status = 'approved';

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;

create or replace function private.set_job_moderation(
  target_job_id uuid,
  target_status text,
  moderation_reason text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_status text;
  normalized_reason text := nullif(trim(moderation_reason), '');
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  if target_status not in ('approved', 'under_review', 'blocked') then
    raise exception 'Unsupported moderation status.';
  end if;

  if normalized_reason is not null and char_length(normalized_reason) > 1000 then
    raise exception 'The moderation note is too long.';
  end if;

  if target_status = 'blocked' and coalesce(char_length(normalized_reason), 0) < 10 then
    raise exception 'A blocking reason of at least 10 characters is required.';
  end if;

  select jobs.moderation_status into previous_status
  from public.jobs where jobs.id = target_job_id for update;

  if previous_status is null then raise exception 'Job not found.'; end if;
  if previous_status = target_status then
    raise exception 'The job already has this moderation status.';
  end if;

  update public.jobs
  set moderation_status = target_status,
      moderation_reason = normalized_reason,
      moderated_at = now(),
      moderated_by = (select auth.uid())
  where id = target_job_id;

  perform private.record_admin_audit_event(
    'job.moderation_status_changed', 'job', target_job_id,
    jsonb_build_object('previous_status', previous_status, 'new_status', target_status, 'reason', normalized_reason)
  );

  return target_status;
end;
$$;

revoke all on function private.set_job_moderation(uuid, text, text)
from public, anon, authenticated;
grant execute on function private.set_job_moderation(uuid, text, text) to authenticated;

create or replace function public.set_job_moderation(
  target_job_id uuid,
  target_status text,
  moderation_reason text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.set_job_moderation(target_job_id, target_status, moderation_reason);
$$;

revoke all on function public.set_job_moderation(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.set_job_moderation(uuid, text, text) to authenticated;
