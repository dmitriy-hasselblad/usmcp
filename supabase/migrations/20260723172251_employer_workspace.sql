-- USHCE employer workspace foundation.
-- Adds multi-tenant organizations, memberships, and organization-owned jobs.

create type public.organization_member_role as enum (
  'owner',
  'admin',
  'recruiter',
  'viewer'
);

create type public.job_status as enum (
  'draft',
  'published',
  'paused',
  'closed'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (
    char_length(slug) between 2 and 180
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  organization_type text not null check (
    char_length(organization_type) between 2 and 120
  ),
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  description text check (
    description is null or char_length(description) <= 2000
  ),
  website text check (website is null or char_length(website) <= 300),
  verification_status text not null default 'unverified' check (
    verification_status in ('unverified', 'pending', 'verified', 'rejected')
  ),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.organization_member_role not null default 'recruiter',
  position_title text check (
    position_title is null or char_length(position_title) between 2 and 120
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  slug text not null unique check (
    char_length(slug) between 3 and 180
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  title text not null check (char_length(title) between 3 and 160),
  specialty text check (
    specialty is null or char_length(specialty) between 2 and 120
  ),
  city text not null check (char_length(city) between 2 and 120),
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  employment_type text not null check (
    employment_type in (
      'Full-time',
      'Part-time',
      'Contract',
      'Temporary',
      'Per diem'
    )
  ),
  workplace_type text not null check (
    workplace_type in ('On-site', 'Hybrid', 'Remote')
  ),
  salary_min integer check (salary_min is null or salary_min >= 0),
  salary_max integer check (salary_max is null or salary_max >= 0),
  salary_period text not null default 'year' check (
    salary_period in ('hour', 'year')
  ),
  visa_support boolean not null default false,
  description text check (
    description is null or char_length(description) <= 10000
  ),
  status public.job_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    salary_min is null
    or salary_max is null
    or salary_max >= salary_min
  ),
  check (
    (status = 'published' and published_at is not null)
    or status <> 'published'
  )
);

alter table public.employer_profiles
add column organization_id uuid references public.organizations (id) on delete set null;

create index organizations_created_by_idx
on public.organizations (created_by);

create index organization_members_user_id_idx
on public.organization_members (user_id, organization_id);

create index employer_profiles_organization_id_idx
on public.employer_profiles (organization_id);

create index jobs_organization_status_created_at_idx
on public.jobs (organization_id, status, created_at desc);

create index jobs_created_by_idx
on public.jobs (created_by);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function private.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function private.set_updated_at();

-- Migrate every existing employer profile into its first organization.
insert into public.organizations (
  name,
  slug,
  organization_type,
  state_code,
  created_by
)
select
  employer_profiles.organization_name,
  coalesce(
    nullif(
      trim(
        both '-' from regexp_replace(
          lower(employer_profiles.organization_name),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ),
      ''
    ),
    'organization'
  ) || '-' || left(employer_profiles.user_id::text, 8),
  employer_profiles.organization_type,
  employer_profiles.state_code,
  employer_profiles.user_id
from public.employer_profiles
where not exists (
  select 1
  from public.organization_members
  where organization_members.user_id = employer_profiles.user_id
);

insert into public.organization_members (
  organization_id,
  user_id,
  role,
  position_title
)
select
  organizations.id,
  employer_profiles.user_id,
  'owner'::public.organization_member_role,
  employer_profiles.position_title
from public.employer_profiles
join public.organizations
  on organizations.created_by = employer_profiles.user_id
where not exists (
  select 1
  from public.organization_members
  where organization_members.user_id = employer_profiles.user_id
);

update public.employer_profiles
set organization_id = member_organizations.organization_id
from (
  select distinct on (organization_members.user_id)
    organization_members.user_id,
    organization_members.organization_id
  from public.organization_members
  order by organization_members.user_id, organization_members.created_at
) as member_organizations
where employer_profiles.user_id = member_organizations.user_id
  and employer_profiles.organization_id is null;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.jobs enable row level security;

create or replace function private.is_organization_member(
  target_organization_id uuid,
  allowed_roles public.organization_member_role[] default null
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
      from public.organization_members
      where organization_members.organization_id = target_organization_id
        and organization_members.user_id = (select auth.uid())
        and (
          allowed_roles is null
          or organization_members.role = any (allowed_roles)
        )
    );
$$;

revoke all on function private.is_organization_member(
  uuid,
  public.organization_member_role[]
) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_organization_member(
  uuid,
  public.organization_member_role[]
) to authenticated;

create policy "Members can read their organization"
on public.organizations
for select
to authenticated
using (private.is_organization_member(id));

create policy "Employers can create organizations"
on public.organizations
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'employer'
  )
);

create policy "Organization managers can update their organization"
on public.organizations
for update
to authenticated
using (
  private.is_organization_member(
    id,
    array['owner', 'admin']::public.organization_member_role[]
  )
)
with check (
  private.is_organization_member(
    id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Members can read organization membership"
on public.organization_members
for select
to authenticated
using (private.is_organization_member(organization_id));

create policy "Organization owners can bootstrap membership"
on public.organization_members
for insert
to authenticated
with check (
  (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = (select auth.uid())
    )
  )
  or private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can update membership"
on public.organization_members
for update
to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
)
with check (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Members can read organization jobs"
on public.jobs
for select
to authenticated
using (private.is_organization_member(organization_id));

create policy "Hiring team can create jobs"
on public.jobs
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

create policy "Hiring team can update jobs"
on public.jobs
for update
to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
)
with check (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_members from anon, authenticated;
revoke all on table public.jobs from anon, authenticated;

grant select on table public.organizations to authenticated;
grant insert (
  name,
  slug,
  organization_type,
  state_code,
  created_by
) on table public.organizations to authenticated;
grant update (
  name,
  organization_type,
  state_code,
  description,
  website
) on table public.organizations to authenticated;

grant select on table public.organization_members to authenticated;
grant insert (
  organization_id,
  user_id,
  role,
  position_title
) on table public.organization_members to authenticated;
grant update (
  role,
  position_title
) on table public.organization_members to authenticated;

grant select on table public.jobs to authenticated;
grant insert (
  organization_id,
  created_by,
  slug,
  title,
  specialty,
  city,
  state_code,
  employment_type,
  workplace_type,
  salary_min,
  salary_max,
  salary_period,
  visa_support,
  description,
  status,
  published_at
) on table public.jobs to authenticated;
grant update (
  title,
  specialty,
  city,
  state_code,
  employment_type,
  workplace_type,
  salary_min,
  salary_max,
  salary_period,
  visa_support,
  description,
  status,
  published_at
) on table public.jobs to authenticated;

grant usage on type public.organization_member_role to authenticated;
grant usage on type public.job_status to authenticated;

grant update (organization_id)
on table public.employer_profiles
to authenticated;

create or replace function public.bootstrap_employer_organization(
  organization_name text,
  organization_slug text,
  organization_type text,
  organization_state_code text,
  member_position_title text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  existing_organization_id uuid;
  new_organization_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where profiles.id = current_user_id
      and profiles.account_type = 'employer'
  ) then
    raise exception 'An employer account is required.';
  end if;

  select organization_members.organization_id
  into existing_organization_id
  from public.organization_members
  where organization_members.user_id = current_user_id
  order by organization_members.created_at
  limit 1;

  if existing_organization_id is not null then
    return existing_organization_id;
  end if;

  insert into public.organizations (
    name,
    slug,
    organization_type,
    state_code,
    created_by
  )
  values (
    organization_name,
    organization_slug,
    organization_type,
    organization_state_code,
    current_user_id
  )
  returning organizations.id into new_organization_id;

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    position_title
  )
  values (
    new_organization_id,
    current_user_id,
    'owner'::public.organization_member_role,
    member_position_title
  );

  update public.employer_profiles
  set organization_id = new_organization_id
  where employer_profiles.user_id = current_user_id;

  return new_organization_id;
end;
$$;

revoke all on function public.bootstrap_employer_organization(
  text,
  text,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.bootstrap_employer_organization(
  text,
  text,
  text,
  text,
  text
) to authenticated;
