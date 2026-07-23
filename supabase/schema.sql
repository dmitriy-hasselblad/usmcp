-- USHCE authentication and onboarding foundation.
-- Apply this file once to a Supabase project before enabling account access.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.account_type as enum ('professional', 'employer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type public.account_type not null,
  first_name text check (
    first_name is null or char_length(first_name) between 2 and 80
  ),
  last_name text check (
    last_name is null or char_length(last_name) between 2 and 80
  ),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professional_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  profession text not null check (char_length(profession) between 2 and 100),
  specialty text check (
    specialty is null or char_length(specialty) between 2 and 120
  ),
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  career_stage text not null check (char_length(career_stage) between 2 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  organization_name text not null check (
    char_length(organization_name) between 2 and 160
  ),
  organization_type text not null check (
    char_length(organization_type) between 2 and 120
  ),
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  position_title text not null check (
    char_length(position_title) between 2 and 120
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.employer_profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Professionals can read their own details"
on public.professional_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Professionals can create their own details"
on public.professional_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = professional_profiles.user_id
      and profiles.account_type = 'professional'
  )
);

create policy "Professionals can update their own details"
on public.professional_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = professional_profiles.user_id
      and profiles.account_type = 'professional'
  )
);

create policy "Employers can read their own details"
on public.employer_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Employers can create their own details"
on public.employer_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = employer_profiles.user_id
      and profiles.account_type = 'employer'
  )
);

create policy "Employers can update their own details"
on public.employer_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = employer_profiles.user_id
      and profiles.account_type = 'employer'
  )
);

grant usage on schema public to authenticated;
grant usage on type public.account_type to authenticated;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.professional_profiles from anon, authenticated;
revoke all on table public.employer_profiles from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (
  first_name,
  last_name,
  onboarding_completed
) on table public.profiles to authenticated;

grant select on table public.professional_profiles to authenticated;
grant insert (
  user_id,
  profession,
  specialty,
  state_code,
  career_stage
) on table public.professional_profiles to authenticated;
grant update (
  profession,
  specialty,
  state_code,
  career_stage
) on table public.professional_profiles to authenticated;

grant select on table public.employer_profiles to authenticated;
grant insert (
  user_id,
  organization_name,
  organization_type,
  state_code,
  position_title
) on table public.employer_profiles to authenticated;
grant update (
  organization_name,
  organization_type,
  state_code,
  position_title
) on table public.employer_profiles to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger professional_profiles_set_updated_at
before update on public.professional_profiles
for each row execute function private.set_updated_at();

create trigger employer_profiles_set_updated_at
before update on public.employer_profiles
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_account_type text;
  safe_account_type public.account_type;
begin
  requested_account_type := new.raw_user_meta_data ->> 'account_type';

  safe_account_type := case requested_account_type
    when 'employer' then 'employer'::public.account_type
    else 'professional'::public.account_type
  end;

  insert into public.profiles (id, account_type)
  values (new.id, safe_account_type);

  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger create_profile_after_user_signup
after insert on auth.users
for each row execute function private.handle_new_user();
