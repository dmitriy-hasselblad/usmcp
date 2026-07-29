-- Candidate applications and employer review workflow.

create type public.application_status as enum (
  'submitted',
  'reviewing',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete restrict,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  job_slug text not null check (
    char_length(job_slug) between 3 and 180
    and job_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  job_title text not null check (char_length(job_title) between 3 and 160),
  organization_name text not null check (
    char_length(organization_name) between 2 and 160
  ),
  candidate_first_name text not null check (
    char_length(candidate_first_name) between 2 and 80
  ),
  candidate_last_name text not null check (
    char_length(candidate_last_name) between 2 and 80
  ),
  candidate_email text not null check (
    char_length(candidate_email) between 3 and 254
  ),
  profession text not null check (char_length(profession) between 2 and 100),
  specialty text check (
    specialty is null or char_length(specialty) between 2 and 120
  ),
  career_stage text not null check (
    char_length(career_stage) between 2 and 80
  ),
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  phone text not null check (char_length(phone) between 7 and 30),
  resume_url text check (
    resume_url is null
    or (
      char_length(resume_url) <= 500
      and resume_url ~* '^https?://'
    )
  ),
  cover_letter text not null check (
    char_length(cover_letter) between 30 and 5000
  ),
  status public.application_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create index applications_candidate_submitted_at_idx
on public.applications (candidate_id, submitted_at desc);

create index applications_organization_status_submitted_at_idx
on public.applications (organization_id, status, submitted_at desc);

create index applications_job_submitted_at_idx
on public.applications (job_id, submitted_at desc);

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
    and jobs.status = 'published';

  if not found then
    raise exception 'This job is not accepting applications.';
  end if;

  new.status := 'submitted'::public.application_status;
  new.submitted_at := now();
  new.updated_at := now();

  return new;
end;
$$;

revoke all on function private.prepare_application()
from public, anon, authenticated;

create trigger applications_prepare_before_insert
before insert on public.applications
for each row execute function private.prepare_application();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function private.set_updated_at();

alter table public.applications enable row level security;

create policy "Candidates and organization members can read applications"
on public.applications
for select
to authenticated
using (
  candidate_id = (select auth.uid())
  or private.is_organization_member(organization_id)
);

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
  )
);

create policy "Candidates and hiring teams can update application status"
on public.applications
for update
to authenticated
using (
  (
    candidate_id = (select auth.uid())
    and status in ('submitted', 'reviewing', 'interview', 'offer')
  )
  or private.is_organization_member(
      organization_id,
      array['owner', 'admin', 'recruiter']::public.organization_member_role[]
    )
)
with check (
  (
    candidate_id = (select auth.uid())
    and status = 'withdrawn'
  )
  or (
    private.is_organization_member(
      organization_id,
      array['owner', 'admin', 'recruiter']::public.organization_member_role[]
    )
    and status in ('submitted', 'reviewing', 'interview', 'offer', 'rejected')
  )
);

revoke all on table public.applications from public, anon, authenticated;

grant select on table public.applications to authenticated;
grant insert (
  job_id,
  candidate_id,
  phone,
  resume_url,
  cover_letter
) on table public.applications to authenticated;
grant update (status) on table public.applications to authenticated;
grant usage on type public.application_status to authenticated;
