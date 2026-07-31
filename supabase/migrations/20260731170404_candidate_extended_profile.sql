-- Candidate skills, languages, visibility controls, and private profile photos.

alter table public.professional_profiles
add column languages text[] not null default '{}'::text[] check (
  cardinality(languages) <= 12
  and array_position(languages, null) is null
),
add column profile_visibility text not null default 'application_only' check (
  profile_visibility in ('application_only', 'private')
),
add column photo_path text unique check (
  photo_path is null or char_length(photo_path) between 40 and 500
);

create table public.professional_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  proficiency text not null default 'proficient' check (
    proficiency in ('developing', 'proficient', 'advanced', 'expert')
  ),
  years_experience smallint check (
    years_experience is null or years_experience between 0 and 70
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index professional_skills_user_name_unique_idx
on public.professional_skills (user_id, lower(name));

create index professional_skills_user_created_idx
on public.professional_skills (user_id, created_at);

create trigger professional_skills_set_updated_at
before update on public.professional_skills
for each row execute function private.set_updated_at();

alter table public.professional_skills enable row level security;

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
        and professional_profiles.profile_visibility = 'application_only'
    )
    and private.can_review_professional(target_user_id);
$$;

revoke all on function private.can_view_extended_professional(uuid)
from public, anon, authenticated;
grant execute on function private.can_view_extended_professional(uuid)
to authenticated;

create policy "Authorized hiring teams can read shared professional details"
on public.professional_profiles
for select
to authenticated
using (private.can_view_extended_professional(user_id));

create policy "Professional skills are application scoped"
on public.professional_skills
for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.can_view_extended_professional(user_id)
);

create policy "Professionals create their skills"
on public.professional_skills
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.professional_profiles
    where professional_profiles.user_id = (select auth.uid())
  )
);

create policy "Professionals update their skills"
on public.professional_skills
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Professionals delete their skills"
on public.professional_skills
for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.professional_skills
from public, anon, authenticated;
grant select, delete on table public.professional_skills to authenticated;
grant insert (
  id,
  user_id,
  name,
  proficiency,
  years_experience
) on table public.professional_skills to authenticated;
grant update (
  name,
  proficiency,
  years_experience
) on table public.professional_skills to authenticated;

grant update (
  languages,
  profile_visibility,
  photo_path
) on table public.professional_profiles to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'professional-photos',
  'professional-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.can_view_professional_photo(
  object_name text
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
      where professional_profiles.photo_path = object_name
        and private.can_view_extended_professional(
          professional_profiles.user_id
        )
    );
$$;

revoke all on function private.can_view_professional_photo(text)
from public, anon, authenticated;
grant execute on function private.can_view_professional_photo(text)
to authenticated;

create policy "Professional photo owners can read objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Authorized hiring teams can read shared photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-photos'
  and private.can_view_professional_photo(name)
);

create policy "Professional photo owners can upload objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Professional photo owners can replace objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Professional photo owners can delete objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
