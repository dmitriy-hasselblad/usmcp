-- Atomic platform-admin organization verification workflow.
-- Direct table updates remain unavailable to authenticated clients so every
-- status change must pass the admin check and write an audit event.

create or replace function private.set_organization_verification(
  target_organization_id uuid,
  target_status text,
  moderation_reason text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_status text;
  normalized_reason text := nullif(trim(moderation_reason), '');
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  if target_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Unsupported verification status.';
  end if;

  if normalized_reason is not null and char_length(normalized_reason) > 1000 then
    raise exception 'The moderation note is too long.';
  end if;

  if target_status = 'rejected' and coalesce(char_length(normalized_reason), 0) < 10 then
    raise exception 'A rejection reason of at least 10 characters is required.';
  end if;

  select organizations.verification_status
  into previous_status
  from public.organizations
  where organizations.id = target_organization_id
  for update;

  if previous_status is null then
    raise exception 'Organization not found.';
  end if;

  if previous_status = target_status then
    raise exception 'The organization already has this verification status.';
  end if;

  update public.organizations
  set verification_status = target_status
  where organizations.id = target_organization_id;

  perform private.record_admin_audit_event(
    'organization.verification_status_changed',
    'organization',
    target_organization_id,
    jsonb_build_object(
      'previous_status', previous_status,
      'new_status', target_status,
      'reason', normalized_reason
    )
  );

  return target_status;
end;
$$;

revoke all on function private.set_organization_verification(uuid, text, text)
from public, anon, authenticated;
grant execute on function private.set_organization_verification(uuid, text, text)
to authenticated;

create or replace function public.set_organization_verification(
  target_organization_id uuid,
  target_status text,
  moderation_reason text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.set_organization_verification(
    target_organization_id,
    target_status,
    moderation_reason
  );
$$;

revoke all on function public.set_organization_verification(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.set_organization_verification(uuid, text, text)
to authenticated;
