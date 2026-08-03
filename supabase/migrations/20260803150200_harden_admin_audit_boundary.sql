-- Keep audit-event insertion out of the exposed Data API.
-- Future privileged operations call this private helper from an atomic,
-- narrowly scoped database function after performing their admin checks.

drop function public.record_admin_audit_event(text, text, uuid, jsonb);

create or replace function private.record_admin_audit_event(
  event_action text,
  event_target_type text,
  event_target_id uuid default null,
  event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_event_id uuid;
begin
  if current_user_id is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  insert into public.admin_audit_events (
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    current_user_id,
    event_action,
    event_target_type,
    event_target_id,
    coalesce(event_metadata, '{}'::jsonb)
  )
  returning id into new_event_id;

  return new_event_id;
end;
$$;

revoke all on function private.record_admin_audit_event(
  text,
  text,
  uuid,
  jsonb
) from public, anon, authenticated;
