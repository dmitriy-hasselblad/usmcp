-- Professional profile editing and private document storage.

create type public.professional_document_type as enum (
  'resume',
  'license',
  'certification',
  'other'
);

alter table public.professional_profiles
add column headline text check (
  headline is null or char_length(headline) between 2 and 160
),
add column city text check (
  city is null or char_length(city) between 2 and 120
),
add column phone text check (
  phone is null or char_length(phone) between 7 and 30
),
add column biography text check (
  biography is null or char_length(biography) <= 2000
),
add column years_experience smallint check (
  years_experience is null
  or years_experience between 0 and 70
);

create table public.professional_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_type public.professional_document_type not null,
  title text not null check (char_length(title) between 1 and 120),
  storage_path text not null unique check (
    char_length(storage_path) between 40 and 500
  ),
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    )
  ),
  file_size bigint not null check (
    file_size > 0 and file_size <= 8388608
  ),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    not is_primary
    or document_type = 'resume'
  ),
  check (
    (
      document_type = 'resume'
      and mime_type in (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    )
    or (
      document_type <> 'resume'
      and mime_type in ('application/pdf', 'image/jpeg', 'image/png')
    )
  )
);

create index professional_documents_user_type_created_at_idx
on public.professional_documents (
  user_id,
  document_type,
  created_at desc
);

create unique index professional_documents_one_primary_resume_idx
on public.professional_documents (user_id)
where document_type = 'resume' and is_primary;

create trigger professional_documents_set_updated_at
before update on public.professional_documents
for each row execute function private.set_updated_at();

alter table public.professional_documents enable row level security;

alter table public.applications
add column resume_document_id uuid
references public.professional_documents (id) on delete restrict;

create index applications_resume_document_id_idx
on public.applications (resume_document_id)
where resume_document_id is not null;

create policy "Professionals and authorized hiring teams can read documents"
on public.professional_documents
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.applications
    where applications.resume_document_id = professional_documents.id
      and private.is_organization_member(applications.organization_id)
  )
);

create policy "Professionals can create their own documents"
on public.professional_documents
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'professional'
      and profiles.onboarding_completed
  )
);

create policy "Professionals can update their own documents"
on public.professional_documents
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Professionals can delete their unused documents"
on public.professional_documents
for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.professional_documents
from public, anon, authenticated;

grant select on table public.professional_documents to authenticated;
grant insert (
  id,
  user_id,
  document_type,
  title,
  storage_path,
  file_name,
  mime_type,
  file_size,
  is_primary
) on table public.professional_documents to authenticated;
grant update (
  title,
  is_primary
) on table public.professional_documents to authenticated;
grant delete on table public.professional_documents to authenticated;
grant usage on type public.professional_document_type to authenticated;

grant update (
  headline,
  city,
  phone,
  biography,
  years_experience
) on table public.professional_profiles to authenticated;

create or replace function public.set_primary_professional_resume(
  target_document_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.professional_documents
    where professional_documents.id = target_document_id
      and professional_documents.user_id = current_user_id
      and professional_documents.document_type = 'resume'
  ) then
    raise exception 'The selected resume is unavailable.';
  end if;

  update public.professional_documents
  set is_primary = false
  where professional_documents.user_id = current_user_id
    and professional_documents.document_type = 'resume'
    and professional_documents.is_primary;

  update public.professional_documents
  set is_primary = true
  where professional_documents.id = target_document_id
    and professional_documents.user_id = current_user_id
    and professional_documents.document_type = 'resume';
end;
$$;

revoke all on function public.set_primary_professional_resume(uuid)
from public, anon, authenticated;
grant execute on function public.set_primary_professional_resume(uuid)
to authenticated;

create or replace function private.can_access_professional_document(
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
      from public.professional_documents
      join public.applications
        on applications.resume_document_id = professional_documents.id
      join public.organization_members
        on organization_members.organization_id = applications.organization_id
      where professional_documents.storage_path = object_name
        and organization_members.user_id = (select auth.uid())
    );
$$;

revoke all on function private.can_access_professional_document(text)
from public, anon, authenticated;
grant execute on function private.can_access_professional_document(text)
to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'professional-documents',
  'professional-documents',
  false,
  8388608,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Professional document owners can read objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Authorized hiring teams can read application resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-documents'
  and private.can_access_professional_document(name)
);

create policy "Professional document owners can upload objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'professional'
      and profiles.onboarding_completed
  )
);

create policy "Professional document owners can delete objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

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

  if new.resume_document_id is not null and not exists (
    select 1
    from public.professional_documents
    where professional_documents.id = new.resume_document_id
      and professional_documents.user_id = current_user_id
      and professional_documents.document_type = 'resume'
  ) then
    raise exception 'The selected resume is unavailable.';
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

  new.resume_url := null;
  new.status := 'submitted'::public.application_status;
  new.submitted_at := now();
  new.updated_at := now();

  return new;
end;
$$;

revoke insert (resume_url)
on table public.applications
from authenticated;

grant insert (resume_document_id)
on table public.applications
to authenticated;
