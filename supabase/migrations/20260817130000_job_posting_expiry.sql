-- Employers select a transparent 30, 60, or 90 day posting period.
-- Public delivery and applications use the exact expiration timestamp, so a
-- role cannot remain discoverable after its selected deadline.

alter table public.jobs
add column posting_duration_days smallint not null default 30
check (posting_duration_days in (30, 60, 90)),
add column expires_at timestamptz;

-- Preserve current public jobs for a full 90 days after this feature ships.
-- New jobs receive their exact expiration timestamp when their employer
-- publishes them.
update public.jobs
set expires_at = now() + interval '90 days'
where status = 'published' and expires_at is null;

create index jobs_public_expiry_idx
on public.jobs (expires_at)
where status = 'published' and moderation_status = 'approved';

grant select (expires_at) on table public.jobs to anon, authenticated;
grant insert (posting_duration_days) on table public.jobs to authenticated;

-- The server action cannot be bypassed to create an arbitrary deadline: the
-- database derives it from the approved duration whenever a role is published.
create or replace function private.set_job_expiration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
    and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now());
    new.expires_at := new.published_at
      + make_interval(days => new.posting_duration_days);
  end if;

  return new;
end;
$$;

revoke all on function private.set_job_expiration() from public, anon, authenticated;

create trigger jobs_set_expiration
before insert or update of status, published_at on public.jobs
for each row execute function private.set_job_expiration();

drop policy if exists "Anonymous can read approved published jobs"
on public.jobs;

create policy "Anonymous can read active approved published jobs"
on public.jobs
for select
to anon
using (
  status = 'published'
  and moderation_status = 'approved'
  and expires_at > now()
);

drop policy if exists "Authenticated users can read available jobs"
on public.jobs;

create policy "Authenticated users can read active jobs"
on public.jobs
for select
to authenticated
using (
  (status = 'published' and moderation_status = 'approved' and expires_at > now())
  or private.is_organization_member(organization_id)
);

-- Keep the application boundary aligned with the marketplace boundary. This
-- protects against a crafted request that targets an expired job directly.
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

  select
    profiles.first_name,
    profiles.last_name,
    auth_users.email,
    professional_profiles.profession,
    professional_profiles.specialty,
    professional_profiles.career_stage,
    professional_profiles.state_code
  into
    new.candidate_first_name,
    new.candidate_last_name,
    new.candidate_email,
    new.profession,
    new.specialty,
    new.career_stage,
    new.state_code
  from public.profiles
  join public.professional_profiles
    on professional_profiles.user_id = profiles.id
  join auth.users as auth_users
    on auth_users.id = profiles.id
  where profiles.id = current_user_id
    and profiles.account_type = 'professional'
    and profiles.onboarding_completed
    and profiles.first_name is not null
    and profiles.last_name is not null
    and auth_users.email is not null;

  if not found then
    raise exception 'A completed professional profile is required.';
  end if;

  select
    jobs.organization_id,
    jobs.slug,
    jobs.title,
    organizations.name
  into
    new.organization_id,
    new.job_slug,
    new.job_title,
    new.organization_name
  from public.jobs
  join public.organizations
    on organizations.id = jobs.organization_id
  where jobs.id = new.job_id
    and jobs.status = 'published'
    and jobs.moderation_status = 'approved'
    and jobs.expires_at > now();

  if not found then
    raise exception 'This job is not accepting applications.';
  end if;

  new.status := 'submitted'::public.application_status;
  new.submitted_at := now();
  new.updated_at := now();

  return new;
end;
$$;

revoke all on function private.prepare_application() from public, anon, authenticated;

drop policy if exists "Professionals can submit applications"
on public.applications;

create policy "Professionals can submit applications"
on public.applications
for insert
to authenticated
with check (
  candidate_id = (select auth.uid())
  and status = 'submitted'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'professional'
      and profiles.onboarding_completed
  )
  and exists (
    select 1
    from public.jobs
    where jobs.id = applications.job_id
      and jobs.organization_id = applications.organization_id
      and jobs.status = 'published'
      and jobs.moderation_status = 'approved'
      and jobs.expires_at > now()
  )
);

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
  jobs.profession, jobs.experience_level, jobs.required_skills, jobs.expires_at
from public.jobs
join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published'
  and jobs.moderation_status = 'approved'
  and jobs.expires_at > now();

revoke all on table public.published_jobs from public, anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
