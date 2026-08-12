-- Private interview scheduling for an active job application.

create table public.application_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  scheduled_by uuid not null references public.profiles (id) on delete restrict,
  starts_at timestamptz not null,
  time_zone text not null check (char_length(time_zone) between 3 and 100),
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  interview_format text not null check (interview_format in ('video', 'phone', 'on_site')),
  location_or_link text check (location_or_link is null or char_length(location_or_link) between 2 and 500),
  notes text check (notes is null or char_length(notes) between 2 and 2000),
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'declined', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index application_interviews_application_starts_at_idx
on public.application_interviews (application_id, starts_at asc);

alter table public.application_interviews enable row level security;

create policy "Application participants can read interviews"
on public.application_interviews for select to authenticated
using (
  candidate_id = (select auth.uid())
  or private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

revoke all on table public.application_interviews from public, anon, authenticated;
grant select on table public.application_interviews to authenticated;

alter table public.user_notifications
drop constraint if exists user_notifications_notification_type_check;

alter table public.user_notifications
add constraint user_notifications_notification_type_check check (
  notification_type in (
    'application_received', 'application_status_changed', 'application_withdrawn',
    'interview_scheduled', 'interview_response'
  )
);

create or replace function public.schedule_application_interview(
  target_application_id uuid,
  target_starts_at timestamptz,
  target_time_zone text,
  target_duration_minutes integer,
  target_interview_format text,
  target_location_or_link text default null,
  target_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_application public.applications%rowtype;
  interview_id uuid;
  current_user_id uuid := (select auth.uid());
begin
  select * into target_application from public.applications where id = target_application_id;

  if current_user_id is null
    or not found
    or target_application.status = 'withdrawn'
    or not private.is_organization_member(target_application.organization_id, array['owner', 'admin', 'recruiter']::public.organization_member_role[]) then
    raise exception 'You are not authorized to schedule an interview for this application.';
  end if;

  if target_starts_at <= now()
    or char_length(trim(target_time_zone)) not between 3 and 100
    or target_duration_minutes not between 15 and 480
    or target_interview_format not in ('video', 'phone', 'on_site')
    or (target_location_or_link is not null and char_length(trim(target_location_or_link)) not between 2 and 500)
    or (target_notes is not null and char_length(trim(target_notes)) not between 2 and 2000) then
    raise exception 'The interview details are invalid.';
  end if;

  insert into public.application_interviews (
    application_id, organization_id, candidate_id, scheduled_by, starts_at,
    time_zone, duration_minutes, interview_format, location_or_link, notes
  ) values (
    target_application.id, target_application.organization_id, target_application.candidate_id,
    current_user_id, target_starts_at, trim(target_time_zone), target_duration_minutes,
    target_interview_format, nullif(trim(target_location_or_link), ''), nullif(trim(target_notes), '')
  ) returning id into interview_id;

  insert into public.user_notifications (user_id, notification_type, title, body, href)
  values (
    target_application.candidate_id, 'interview_scheduled', 'Interview invitation received',
    target_application.organization_name || ' proposed an interview for ' || target_application.job_title || '.',
    '/dashboard/applications/' || target_application.id::text
  );

  return interview_id;
end;
$$;

create or replace function public.respond_to_application_interview(target_interview_id uuid, target_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_interview public.application_interviews%rowtype;
  target_application public.applications%rowtype;
  current_user_id uuid := (select auth.uid());
  response_label text;
begin
  select * into target_interview from public.application_interviews where id = target_interview_id for update;
  if current_user_id is null or not found or target_interview.candidate_id <> current_user_id or target_interview.status <> 'proposed' or target_status not in ('confirmed', 'declined') then
    raise exception 'This interview response is not available.';
  end if;

  select * into target_application from public.applications where id = target_interview.application_id;
  update public.application_interviews set status = target_status, responded_at = now(), updated_at = now() where id = target_interview.id;
  response_label := case target_status when 'confirmed' then 'confirmed' else 'declined' end;

  insert into public.user_notifications (user_id, notification_type, title, body, href)
  select organization_members.user_id, 'interview_response', 'Interview response received',
    target_application.candidate_first_name || ' ' || target_application.candidate_last_name || ' ' || response_label || ' the interview invitation for ' || target_application.job_title || '.',
    '/dashboard/applications/' || target_application.id::text
  from public.organization_members
  where organization_members.organization_id = target_interview.organization_id
    and organization_members.role in ('owner', 'admin', 'recruiter');
end;
$$;

create or replace function public.cancel_application_interview(target_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_interview public.application_interviews%rowtype;
  target_application public.applications%rowtype;
  current_user_id uuid := (select auth.uid());
begin
  select * into target_interview from public.application_interviews where id = target_interview_id for update;
  if current_user_id is null or not found or target_interview.status in ('declined', 'cancelled')
    or not private.is_organization_member(target_interview.organization_id, array['owner', 'admin', 'recruiter']::public.organization_member_role[]) then
    raise exception 'This interview cannot be cancelled.';
  end if;

  select * into target_application from public.applications where id = target_interview.application_id;
  update public.application_interviews set status = 'cancelled', updated_at = now() where id = target_interview.id;

  insert into public.user_notifications (user_id, notification_type, title, body, href)
  values (
    target_interview.candidate_id, 'interview_scheduled', 'Interview cancelled',
    target_application.organization_name || ' cancelled the interview for ' || target_application.job_title || '.',
    '/dashboard/applications/' || target_application.id::text
  );
end;
$$;

revoke all on function public.schedule_application_interview(uuid, timestamptz, text, integer, text, text, text) from public, anon;
revoke all on function public.respond_to_application_interview(uuid, text) from public, anon;
revoke all on function public.cancel_application_interview(uuid) from public, anon;
grant execute on function public.schedule_application_interview(uuid, timestamptz, text, integer, text, text, text) to authenticated;
grant execute on function public.respond_to_application_interview(uuid, text) to authenticated;
grant execute on function public.cancel_application_interview(uuid) to authenticated;

comment on table public.application_interviews is 'Private interview invitations for a single candidate application.';
