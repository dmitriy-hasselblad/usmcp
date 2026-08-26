-- Candidate-controlled discovery settings and saved job searches.
-- All records remain private to the professional who created them.

alter table public.professional_profiles
add column preferred_employment_types text[] not null default '{}'::text[] check (
  cardinality(preferred_employment_types) <= 5
  and array_position(preferred_employment_types, null) is null
),
add column preferred_workplace_types text[] not null default '{}'::text[] check (
  cardinality(preferred_workplace_types) <= 3
  and array_position(preferred_workplace_types, null) is null
),
add column willing_to_relocate boolean not null default false,
add column availability_timing text not null default 'Not specified' check (
  availability_timing in (
    'Not specified',
    'Immediately',
    'Within 30 days',
    'Within 1 to 3 months',
    'More than 3 months'
  )
);

grant update (
  preferred_employment_types,
  preferred_workplace_types,
  willing_to_relocate,
  availability_timing
) on table public.professional_profiles to authenticated;

create table public.saved_job_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  profession text check (profession is null or char_length(profession) between 2 and 120),
  specialty text check (specialty is null or char_length(specialty) between 2 and 120),
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  city text check (city is null or char_length(city) between 2 and 120),
  employment_type text check (
    employment_type is null or employment_type in (
      'Full-time', 'Part-time', 'Contract', 'Temporary', 'Per diem'
    )
  ),
  workplace_type text check (
    workplace_type is null or workplace_type in ('On-site', 'Hybrid', 'Remote')
  ),
  experience_level text check (
    experience_level is null or char_length(experience_level) between 2 and 80
  ),
  visa_support boolean,
  search_text text check (search_text is null or char_length(search_text) between 2 and 120),
  alerts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index saved_job_searches_user_updated_idx
on public.saved_job_searches (user_id, updated_at desc);

alter table public.saved_job_searches enable row level security;

create policy "Professionals can read their saved job searches"
on public.saved_job_searches for select to authenticated
using (user_id = (select auth.uid()));

create policy "Professionals can create their saved job searches"
on public.saved_job_searches for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'professional'
      and profiles.onboarding_completed
  )
);

create policy "Professionals can update their saved job searches"
on public.saved_job_searches for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Professionals can delete their saved job searches"
on public.saved_job_searches for delete to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.saved_job_searches from public, anon, authenticated;
grant select, insert, update, delete on table public.saved_job_searches to authenticated;

create trigger saved_job_searches_set_updated_at
before update on public.saved_job_searches
for each row execute function private.set_updated_at();

alter table public.user_notifications
drop constraint if exists user_notifications_notification_type_check;

alter table public.user_notifications
add constraint user_notifications_notification_type_check check (
  notification_type in (
    'application_received', 'application_status_changed', 'application_withdrawn',
    'interview_scheduled', 'interview_response', 'job_search_match'
  )
);

create or replace function private.notify_saved_search_matches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'published'::public.job_status
    or old.status = 'published'::public.job_status then
    return new;
  end if;

  insert into public.user_notifications (
    user_id, notification_type, title, body, href
  )
  select
    searches.user_id,
    'job_search_match',
    'New job matches your saved search',
    new.title || ' at ' || organizations.name || ' matches "' || searches.name || '".',
    '/jobs/' || new.slug
  from public.saved_job_searches as searches
  join public.profiles on profiles.id = searches.user_id
  join public.organizations on organizations.id = new.organization_id
  where searches.alerts_enabled
    and profiles.account_type = 'professional'
    and profiles.onboarding_completed
    and (searches.profession is null or searches.profession = new.profession)
    and (searches.specialty is null or searches.specialty = new.specialty)
    and (searches.state_code is null or searches.state_code = new.state_code)
    and (searches.city is null or lower(searches.city) = lower(new.city))
    and (searches.employment_type is null or searches.employment_type = new.employment_type)
    and (searches.workplace_type is null or searches.workplace_type = new.workplace_type)
    and (searches.experience_level is null or searches.experience_level = new.experience_level)
    and (searches.visa_support is null or searches.visa_support = new.visa_support)
    and (
      searches.search_text is null
      or concat_ws(' ', new.title, new.profession, new.specialty, new.description)
        ilike '%' || searches.search_text || '%'
    );

  return new;
end;
$$;

revoke all on function private.notify_saved_search_matches()
from public, anon, authenticated;

create trigger jobs_notify_saved_search_matches
after update of status on public.jobs
for each row execute function private.notify_saved_search_matches();

comment on table public.saved_job_searches is
  'Private saved job-search criteria and in-product alert preferences.';
