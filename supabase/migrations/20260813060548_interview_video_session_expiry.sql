-- Close private LiveKit access shortly after a participant ends or leaves an interview.

alter table public.application_interviews
add column if not exists video_ended_at timestamptz;

-- Video interviews that were already scheduled in the past must not remain
-- joinable after this protection is introduced.
update public.application_interviews
set video_ended_at = starts_at + make_interval(mins => duration_minutes)
where interview_format = 'video'
  and status = 'confirmed'
  and video_ended_at is null
  and starts_at + make_interval(mins => duration_minutes) < now();

create or replace function public.start_application_interview_video(target_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_interview public.application_interviews%rowtype;
  current_user_id uuid := (select auth.uid());
begin
  select * into target_interview
  from public.application_interviews
  where id = target_interview_id
  for update;

  if current_user_id is null
    or not found
    or target_interview.status <> 'confirmed'
    or target_interview.interview_format <> 'video'
    or not (
      target_interview.candidate_id = current_user_id
      or private.is_organization_member(
        target_interview.organization_id,
        array['owner', 'admin', 'recruiter']::public.organization_member_role[]
      )
    ) then
    raise exception 'This video interview is not available.';
  end if;

  if target_interview.video_ended_at is not null
    and target_interview.video_ended_at < now() - interval '5 minutes' then
    raise exception 'The video interview access window has ended.';
  end if;

  update public.application_interviews
  set video_ended_at = null,
      updated_at = now()
  where id = target_interview.id;
end;
$$;

create or replace function public.end_application_interview_video(target_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_interview public.application_interviews%rowtype;
  current_user_id uuid := (select auth.uid());
begin
  select * into target_interview
  from public.application_interviews
  where id = target_interview_id
  for update;

  if current_user_id is null
    or not found
    or target_interview.status <> 'confirmed'
    or target_interview.interview_format <> 'video'
    or not (
      target_interview.candidate_id = current_user_id
      or private.is_organization_member(
        target_interview.organization_id,
        array['owner', 'admin', 'recruiter']::public.organization_member_role[]
      )
    ) then
    raise exception 'This video interview cannot be ended.';
  end if;

  update public.application_interviews
  set video_ended_at = now(),
      updated_at = now()
  where id = target_interview.id;
end;
$$;

revoke execute on function public.start_application_interview_video(uuid) from public, anon;
revoke execute on function public.end_application_interview_video(uuid) from public, anon;
grant execute on function public.start_application_interview_video(uuid) to authenticated;
grant execute on function public.end_application_interview_video(uuid) to authenticated;

comment on column public.application_interviews.video_ended_at is 'The latest participant disconnect. Rejoining is allowed for five minutes.';
