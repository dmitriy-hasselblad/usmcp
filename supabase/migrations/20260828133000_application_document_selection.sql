-- A candidate chooses which private application documents to share for each application.
-- Nothing is shared automatically.

alter table public.applications
  add column if not exists resume_builder_id uuid
    references public.professional_resumes (id) on delete restrict,
  add column if not exists cover_letter_document_id uuid
    references public.professional_documents (id) on delete restrict,
  add column if not exists cover_letter_builder_id uuid
    references public.professional_cover_letters (id) on delete restrict;

create index if not exists applications_resume_builder_id_idx
  on public.applications (resume_builder_id)
  where resume_builder_id is not null;

create index if not exists applications_cover_letter_document_id_idx
  on public.applications (cover_letter_document_id)
  where cover_letter_document_id is not null;

create index if not exists applications_cover_letter_builder_id_idx
  on public.applications (cover_letter_builder_id)
  where cover_letter_builder_id is not null;

drop policy if exists "Professionals and authorized hiring teams can read documents"
  on public.professional_documents;

create policy "Professionals and authorized hiring teams can read documents"
on public.professional_documents
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.applications
    where (
      applications.resume_document_id = professional_documents.id
      or applications.cover_letter_document_id = professional_documents.id
    )
      and private.is_organization_member(applications.organization_id)
  )
);

drop policy if exists "Professionals read their private resumes"
  on public.professional_resumes;

create policy "Professionals and authorized hiring teams can read selected resumes"
on public.professional_resumes
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.applications
    where applications.resume_builder_id = professional_resumes.id
      and private.is_organization_member(applications.organization_id)
  )
);

drop policy if exists "Professionals read their private cover letters"
  on public.professional_cover_letters;

create policy "Professionals and authorized hiring teams can read selected cover letters"
on public.professional_cover_letters
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.applications
    where applications.cover_letter_builder_id = professional_cover_letters.id
      and private.is_organization_member(applications.organization_id)
  )
);

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
        or applications.cover_letter_document_id = professional_documents.id
      join public.organization_members
        on organization_members.organization_id = applications.organization_id
      where professional_documents.storage_path = object_name
        and organization_members.user_id = (select auth.uid())
    );
$$;

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

  if new.resume_document_id is not null and new.resume_builder_id is not null then
    raise exception 'Choose one resume or CV for this application.';
  end if;

  if new.cover_letter_document_id is not null and new.cover_letter_builder_id is not null then
    raise exception 'Choose one cover letter for this application.';
  end if;

  select profiles.first_name, profiles.last_name, auth_users.email,
    professional_profiles.profession, professional_profiles.specialty,
    professional_profiles.career_stage, professional_profiles.state_code
  into new.candidate_first_name, new.candidate_last_name, new.candidate_email,
    new.profession, new.specialty, new.career_stage, new.state_code
  from public.profiles
  join public.professional_profiles on professional_profiles.user_id = profiles.id
  join auth.users as auth_users on auth_users.id = profiles.id
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
    select 1 from public.professional_documents
    where id = new.resume_document_id
      and user_id = current_user_id
      and document_type = 'resume'
  ) then
    raise exception 'The selected uploaded resume is unavailable.';
  end if;

  if new.resume_builder_id is not null and not exists (
    select 1 from public.professional_resumes
    where id = new.resume_builder_id and user_id = current_user_id
  ) then
    raise exception 'The selected CV Builder document is unavailable.';
  end if;

  if new.cover_letter_document_id is not null and not exists (
    select 1 from public.professional_documents
    where id = new.cover_letter_document_id
      and user_id = current_user_id
      and document_type = 'cover_letter'
  ) then
    raise exception 'The selected uploaded cover letter is unavailable.';
  end if;

  if new.cover_letter_builder_id is not null and not exists (
    select 1 from public.professional_cover_letters
    where id = new.cover_letter_builder_id and user_id = current_user_id
  ) then
    raise exception 'The selected Cover Letter Builder document is unavailable.';
  end if;

  select jobs.organization_id, jobs.slug, jobs.title, organizations.name
  into new.organization_id, new.job_slug, new.job_title, new.organization_name
  from public.jobs
  join public.organizations on organizations.id = jobs.organization_id
  where jobs.id = new.job_id
    and jobs.status = 'published'
    and jobs.moderation_status = 'approved'
    and jobs.expires_at > now()
    and jobs.open_positions > 0;

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

grant insert (
  resume_builder_id,
  cover_letter_document_id,
  cover_letter_builder_id
) on public.applications to authenticated;

revoke all on function private.can_access_professional_document(text) from public, anon, authenticated;
grant execute on function private.can_access_professional_document(text) to authenticated;
