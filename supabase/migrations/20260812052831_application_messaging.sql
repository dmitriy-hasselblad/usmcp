-- Private, application-scoped messaging between a candidate and hiring team.

create table public.application_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  sender_user_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index application_messages_application_created_at_idx
on public.application_messages (application_id, created_at asc);

alter table public.application_messages enable row level security;

create policy "Application participants can read messages"
on public.application_messages
for select
to authenticated
using (
  candidate_id = (select auth.uid())
  or private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

create policy "Application participants can send messages"
on public.application_messages
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and (
    candidate_id = (select auth.uid())
    or private.is_organization_member(
      organization_id,
      array['owner', 'admin', 'recruiter']::public.organization_member_role[]
    )
  )
  and exists (
    select 1
    from public.applications
    where applications.id = application_messages.application_id
      and applications.organization_id = application_messages.organization_id
      and applications.candidate_id = application_messages.candidate_id
      and applications.status <> 'withdrawn'
  )
);

revoke all on table public.application_messages from public, anon, authenticated;
grant select, insert on table public.application_messages to authenticated;

create or replace function private.prepare_application_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_application public.applications%rowtype;
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null or new.sender_user_id <> current_user_id then
    raise exception 'Messages must be sent by the signed-in user.';
  end if;

  select *
  into target_application
  from public.applications
  where id = new.application_id;

  if not found or target_application.status = 'withdrawn' then
    raise exception 'This application is not available for messaging.';
  end if;

  new.organization_id := target_application.organization_id;
  new.candidate_id := target_application.candidate_id;
  new.body := trim(new.body);
  return new;
end;
$$;

revoke all on function private.prepare_application_message() from public, anon, authenticated;

create trigger application_messages_prepare_before_insert
before insert on public.application_messages
for each row execute function private.prepare_application_message();

create or replace function private.notify_application_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_application public.applications%rowtype;
begin
  select * into target_application from public.applications where id = new.application_id;

  if new.sender_user_id = new.candidate_id then
    insert into public.user_notifications (user_id, notification_type, title, body, href)
    select
      organization_members.user_id,
      'application_received',
      'New message from an applicant',
      new.body,
      '/dashboard/applications/' || new.application_id::text
    from public.organization_members
    where organization_members.organization_id = new.organization_id
      and organization_members.role in ('owner', 'admin', 'recruiter')
      and organization_members.user_id <> new.sender_user_id;
  else
    insert into public.user_notifications (user_id, notification_type, title, body, href)
    values (
      new.candidate_id,
      'application_status_changed',
      'New message from ' || target_application.organization_name,
      new.body,
      '/dashboard/applications/' || new.application_id::text
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_application_message() from public, anon, authenticated;

create trigger application_messages_notify_after_insert
after insert on public.application_messages
for each row execute function private.notify_application_message();

comment on table public.application_messages is
  'Private messages limited to an application candidate and authorized hiring team.';
