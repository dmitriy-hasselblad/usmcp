-- Employer candidate discovery with explicit professional opt-in and
-- organization-scoped saved candidates.

alter table public.professional_profiles
drop constraint professional_profiles_profile_visibility_check;

alter table public.professional_profiles
add constraint professional_profiles_profile_visibility_check check (
  profile_visibility in ('employer_search', 'application_only', 'private')
);

create table public.saved_candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  saved_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, candidate_id)
);

create index saved_candidates_organization_created_idx
on public.saved_candidates (organization_id, created_at desc);

create index saved_candidates_candidate_idx
on public.saved_candidates (candidate_id);

alter table public.saved_candidates enable row level security;

create policy "Organization members can read saved candidates"
on public.saved_candidates
for select
to authenticated
using (private.is_organization_member(organization_id));

create policy "Hiring teams can save discoverable candidates"
on public.saved_candidates
for insert
to authenticated
with check (
  saved_by = (select auth.uid())
  and private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
  and exists (
    select 1
    from public.professional_profiles
    where professional_profiles.user_id = saved_candidates.candidate_id
      and professional_profiles.profile_visibility = 'employer_search'
  )
);

create policy "Hiring teams can remove saved candidates"
on public.saved_candidates
for delete
to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

revoke all on table public.saved_candidates from public, anon, authenticated;
grant select, delete on table public.saved_candidates to authenticated;
grant insert (organization_id, candidate_id, saved_by)
on table public.saved_candidates to authenticated;

create or replace function public.search_candidate_directory(
  target_organization_id uuid,
  search_text text default null,
  profession_filter text default null,
  state_filter text default null,
  saved_only boolean default false,
  result_limit integer default 24,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  headline text,
  profession text,
  specialty text,
  state_code text,
  city text,
  career_stage text,
  years_experience smallint,
  languages text[],
  biography text,
  photo_path text,
  is_saved boolean,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    professional_profiles.user_id,
    profiles.first_name,
    profiles.last_name,
    professional_profiles.headline,
    professional_profiles.profession,
    professional_profiles.specialty,
    professional_profiles.state_code,
    professional_profiles.city,
    professional_profiles.career_stage,
    professional_profiles.years_experience,
    professional_profiles.languages,
    professional_profiles.biography,
    professional_profiles.photo_path,
    saved_candidates.id is not null as is_saved,
    count(*) over () as total_count
  from public.professional_profiles
  join public.profiles on profiles.id = professional_profiles.user_id
  left join public.account_moderation
    on account_moderation.user_id = professional_profiles.user_id
  left join public.saved_candidates
    on saved_candidates.organization_id = target_organization_id
    and saved_candidates.candidate_id = professional_profiles.user_id
  where private.is_organization_member(target_organization_id)
    and professional_profiles.profile_visibility = 'employer_search'
    and profiles.account_type = 'professional'
    and coalesce(account_moderation.status, 'active') = 'active'
    and (
      nullif(trim(search_text), '') is null
      or concat_ws(
        ' ', profiles.first_name, profiles.last_name,
        professional_profiles.headline, professional_profiles.profession,
        professional_profiles.specialty, professional_profiles.city
      ) ilike '%' || trim(search_text) || '%'
    )
    and (
      nullif(trim(profession_filter), '') is null
      or professional_profiles.profession = profession_filter
    )
    and (
      nullif(trim(state_filter), '') is null
      or professional_profiles.state_code = state_filter
    )
    and (not saved_only or saved_candidates.id is not null)
  order by saved_candidates.created_at desc nulls last,
    professional_profiles.updated_at desc,
    professional_profiles.user_id
  limit least(greatest(result_limit, 1), 48)
  offset greatest(result_offset, 0);
$$;

revoke all on function public.search_candidate_directory(
  uuid, text, text, text, boolean, integer, integer
) from public, anon, authenticated;
grant execute on function public.search_candidate_directory(
  uuid, text, text, text, boolean, integer, integer
) to authenticated;

create or replace function private.can_view_extended_professional(
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
      from public.professional_profiles
      where professional_profiles.user_id = target_user_id
        and (
          (
            professional_profiles.profile_visibility = 'application_only'
            and private.can_review_professional(target_user_id)
          )
          or (
            professional_profiles.profile_visibility = 'employer_search'
            and exists (
              select 1
              from public.organization_members
              where organization_members.user_id = (select auth.uid())
            )
          )
        )
    );
$$;

revoke all on function private.can_view_extended_professional(uuid)
from public, anon, authenticated;
grant execute on function private.can_view_extended_professional(uuid)
to authenticated;
