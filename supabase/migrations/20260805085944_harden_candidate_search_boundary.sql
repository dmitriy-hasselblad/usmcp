-- Harden the candidate directory to use caller RLS and close advisor gaps.

create index saved_candidates_saved_by_idx
on public.saved_candidates (saved_by);

create or replace function private.is_active_account(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select account_moderation.status = 'active'
      from public.account_moderation
      where account_moderation.user_id = target_user_id
    ),
    true
  );
$$;

revoke all on function private.is_active_account(uuid)
from public, anon, authenticated;
grant execute on function private.is_active_account(uuid) to authenticated;

create policy "Employer members can read discoverable profile names"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.professional_profiles
    where professional_profiles.user_id = profiles.id
      and professional_profiles.profile_visibility = 'employer_search'
  )
  and exists (
    select 1
    from public.organization_members
    where organization_members.user_id = (select auth.uid())
  )
);

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
security invoker
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
  left join public.saved_candidates
    on saved_candidates.organization_id = target_organization_id
    and saved_candidates.candidate_id = professional_profiles.user_id
  where private.is_organization_member(target_organization_id)
    and professional_profiles.profile_visibility = 'employer_search'
    and profiles.account_type = 'professional'
    and private.is_active_account(professional_profiles.user_id)
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
