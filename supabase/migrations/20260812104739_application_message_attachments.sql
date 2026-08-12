-- Private application-message attachments with participant-only Storage access.

create table public.application_message_attachments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  storage_path text not null unique check (char_length(storage_path) between 5 and 500),
  file_name text not null check (char_length(file_name) between 1 and 180),
  mime_type text not null check (mime_type in ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png')),
  file_size integer not null check (file_size between 1 and 10485760),
  created_at timestamptz not null default now()
);

create index application_message_attachments_application_created_at_idx
on public.application_message_attachments (application_id, created_at asc);

alter table public.application_message_attachments enable row level security;

create policy "Application participants can read message attachments"
on public.application_message_attachments for select to authenticated
using (candidate_id = (select auth.uid()) or private.is_organization_member(organization_id, array['owner', 'admin', 'recruiter']::public.organization_member_role[]));

create policy "Application participants can register their attachments"
on public.application_message_attachments for insert to authenticated
with check (uploaded_by = (select auth.uid()) and (candidate_id = (select auth.uid()) or private.is_organization_member(organization_id, array['owner', 'admin', 'recruiter']::public.organization_member_role[])));

revoke all on table public.application_message_attachments from public, anon, authenticated;
grant select, insert on table public.application_message_attachments to authenticated;

create or replace function private.prepare_application_message_attachment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_application public.applications%rowtype; current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null or new.uploaded_by <> current_user_id then raise exception 'Attachments must be uploaded by the signed-in user.'; end if;
  select * into target_application from public.applications where id = new.application_id;
  if not found or target_application.status = 'withdrawn' then raise exception 'This application is not available for attachments.'; end if;
  new.organization_id := target_application.organization_id; new.candidate_id := target_application.candidate_id;
  if new.storage_path !~ ('^' || new.application_id::text || '/' || current_user_id::text || '/[0-9a-f-]{36}/[^/]+$') then raise exception 'Attachment storage path is invalid.'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'application-message-attachments' and name = new.storage_path and metadata->>'mimetype' = new.mime_type and (metadata->>'size')::bigint = new.file_size) then raise exception 'Attachment upload could not be verified.'; end if;
  return new;
end; $$;
revoke all on function private.prepare_application_message_attachment() from public, anon, authenticated;

create trigger application_message_attachments_prepare_before_insert before insert on public.application_message_attachments for each row execute function private.prepare_application_message_attachment();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-message-attachments','application-message-attachments',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']::text[])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.can_access_application_message_attachment(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (select 1 from public.application_message_attachments where storage_path = object_name and (candidate_id = (select auth.uid()) or private.is_organization_member(organization_id, array['owner','admin','recruiter']::public.organization_member_role[])));
$$;
revoke all on function private.can_access_application_message_attachment(text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.can_access_application_message_attachment(text) to authenticated;

create policy "Application participants can read attachment objects" on storage.objects for select to authenticated using (bucket_id = 'application-message-attachments' and private.can_access_application_message_attachment(name));
create policy "Application participants can upload attachment objects" on storage.objects for insert to authenticated with check (bucket_id = 'application-message-attachments' and (storage.foldername(name))[2] = (select auth.uid())::text and exists (select 1 from public.applications where applications.id::text = (storage.foldername(name))[1] and applications.status <> 'withdrawn' and (applications.candidate_id = (select auth.uid()) or private.is_organization_member(applications.organization_id, array['owner','admin','recruiter']::public.organization_member_role[]))));

create or replace function private.notify_application_message_attachment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_application public.applications%rowtype;
begin
  select * into target_application from public.applications where id = new.application_id;
  if new.uploaded_by = new.candidate_id then
    insert into public.user_notifications (user_id, notification_type, title, body, href)
    select user_id, 'application_received', 'New attachment from an applicant', new.file_name, '/dashboard/applications/' || new.application_id::text from public.organization_members where organization_id = new.organization_id and role in ('owner','admin','recruiter') and user_id <> new.uploaded_by;
  else
    insert into public.user_notifications (user_id, notification_type, title, body, href) values (new.candidate_id, 'application_status_changed', 'New attachment from ' || target_application.organization_name, new.file_name, '/dashboard/applications/' || new.application_id::text);
  end if;
  return new;
end; $$;
revoke all on function private.notify_application_message_attachment() from public, anon, authenticated;
create trigger application_message_attachments_notify_after_insert after insert on public.application_message_attachments for each row execute function private.notify_application_message_attachment();
