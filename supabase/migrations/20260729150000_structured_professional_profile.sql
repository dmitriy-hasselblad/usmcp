-- Structured professional career records with application-scoped employer access.

create or replace function private.can_review_professional(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.applications
      join public.organization_members
        on organization_members.organization_id = applications.organization_id
      where applications.candidate_id = target_user_id
        and applications.status <> 'withdrawn'::public.application_status
        and organization_members.user_id = (select auth.uid())
    );
$$;

revoke all on function private.can_review_professional(uuid)
from public, anon, authenticated;
grant execute on function private.can_review_professional(uuid)
to authenticated;

create table public.professional_education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  education_type text not null check (
    education_type in (
      'degree',
      'medical_school',
      'residency',
      'fellowship',
      'other_training'
    )
  ),
  institution text not null check (char_length(institution) between 2 and 180),
  program text not null check (char_length(program) between 2 and 180),
  specialty text check (
    specialty is null or char_length(specialty) between 2 and 120
  ),
  city text check (city is null or char_length(city) between 2 and 120),
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  country text not null default 'United States' check (
    char_length(country) between 2 and 100
  ),
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text check (
    description is null or char_length(description) <= 1200
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_current or end_date is not null),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.professional_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_name text not null check (
    char_length(organization_name) between 2 and 180
  ),
  role_title text not null check (char_length(role_title) between 2 and 160),
  employment_type text check (
    employment_type is null or char_length(employment_type) between 2 and 80
  ),
  city text check (city is null or char_length(city) between 2 and 120),
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text check (
    description is null or char_length(description) <= 1600
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_current or end_date is not null),
  check (end_date is null or end_date >= start_date)
);

create table public.professional_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  license_type text not null check (
    char_length(license_type) between 2 and 120
  ),
  license_number text not null check (
    char_length(license_number) between 2 and 80
  ),
  issuing_state text not null check (issuing_state ~ '^[A-Z]{2}$'),
  issued_on date,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_on is null or issued_on is null or expires_on >= issued_on),
  unique (user_id, issuing_state, license_number)
);

create table public.professional_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 180),
  issuing_organization text not null check (
    char_length(issuing_organization) between 2 and 180
  ),
  credential_id text check (
    credential_id is null or char_length(credential_id) between 2 and 100
  ),
  issued_on date,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_on is null or issued_on is null or expires_on >= issued_on)
);

create index professional_education_user_start_idx
on public.professional_education (user_id, start_date desc);
create index professional_experience_user_start_idx
on public.professional_experience (user_id, start_date desc);
create index professional_licenses_user_expiry_idx
on public.professional_licenses (user_id, expires_on);
create index professional_certifications_user_expiry_idx
on public.professional_certifications (user_id, expires_on);

create trigger professional_education_set_updated_at
before update on public.professional_education
for each row execute function private.set_updated_at();
create trigger professional_experience_set_updated_at
before update on public.professional_experience
for each row execute function private.set_updated_at();
create trigger professional_licenses_set_updated_at
before update on public.professional_licenses
for each row execute function private.set_updated_at();
create trigger professional_certifications_set_updated_at
before update on public.professional_certifications
for each row execute function private.set_updated_at();

alter table public.professional_education enable row level security;
alter table public.professional_experience enable row level security;
alter table public.professional_licenses enable row level security;
alter table public.professional_certifications enable row level security;

create policy "Career education is application scoped"
on public.professional_education for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_review_professional(user_id)
);
create policy "Professionals create their education"
on public.professional_education for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.professional_profiles
    where professional_profiles.user_id = (select auth.uid())
  )
);
create policy "Professionals update their education"
on public.professional_education for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Professionals delete their education"
on public.professional_education for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Career experience is application scoped"
on public.professional_experience for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_review_professional(user_id)
);
create policy "Professionals create their experience"
on public.professional_experience for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.professional_profiles
    where professional_profiles.user_id = (select auth.uid())
  )
);
create policy "Professionals update their experience"
on public.professional_experience for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Professionals delete their experience"
on public.professional_experience for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Career licenses are application scoped"
on public.professional_licenses for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_review_professional(user_id)
);
create policy "Professionals create their licenses"
on public.professional_licenses for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.professional_profiles
    where professional_profiles.user_id = (select auth.uid())
  )
);
create policy "Professionals update their licenses"
on public.professional_licenses for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Professionals delete their licenses"
on public.professional_licenses for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Career certifications are application scoped"
on public.professional_certifications for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_review_professional(user_id)
);
create policy "Professionals create their certifications"
on public.professional_certifications for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.professional_profiles
    where professional_profiles.user_id = (select auth.uid())
  )
);
create policy "Professionals update their certifications"
on public.professional_certifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Professionals delete their certifications"
on public.professional_certifications for delete to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.professional_education
from public, anon, authenticated;
revoke all on table public.professional_experience
from public, anon, authenticated;
revoke all on table public.professional_licenses
from public, anon, authenticated;
revoke all on table public.professional_certifications
from public, anon, authenticated;

grant select, delete on table public.professional_education to authenticated;
grant insert (
  user_id, education_type, institution, program, specialty, city, state_code,
  country, start_date, end_date, is_current, description
) on table public.professional_education to authenticated;
grant update (
  education_type, institution, program, specialty, city, state_code, country,
  start_date, end_date, is_current, description
) on table public.professional_education to authenticated;

grant select, delete on table public.professional_experience to authenticated;
grant insert (
  user_id, organization_name, role_title, employment_type, city, state_code,
  start_date, end_date, is_current, description
) on table public.professional_experience to authenticated;
grant update (
  organization_name, role_title, employment_type, city, state_code, start_date,
  end_date, is_current, description
) on table public.professional_experience to authenticated;

grant select, delete on table public.professional_licenses to authenticated;
grant insert (
  user_id, license_type, license_number, issuing_state, issued_on, expires_on
) on table public.professional_licenses to authenticated;
grant update (
  license_type, license_number, issuing_state, issued_on, expires_on
) on table public.professional_licenses to authenticated;

grant select, delete on table public.professional_certifications
to authenticated;
grant insert (
  user_id, name, issuing_organization, credential_id, issued_on, expires_on
) on table public.professional_certifications to authenticated;
grant update (
  name, issuing_organization, credential_id, issued_on, expires_on
) on table public.professional_certifications to authenticated;
