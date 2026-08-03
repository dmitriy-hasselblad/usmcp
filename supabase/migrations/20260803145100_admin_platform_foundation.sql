-- USHCE platform administration foundation.
-- Keeps platform administrators separate from organization membership and
-- establishes an append-only audit boundary for future moderation actions.

create table public.platform_admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  granted_by uuid references public.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  is_active boolean not null default true,
  note text check (note is null or char_length(note) <= 500)
);

create table public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id) on delete restrict,
  action text not null check (
    char_length(action) between 3 and 100
    and action ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  target_type text not null check (
    char_length(target_type) between 2 and 80
    and target_type ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
  ),
  created_at timestamptz not null default now()
);

create index admin_audit_events_created_at_idx
on public.admin_audit_events (created_at desc);

create index admin_audit_events_target_idx
on public.admin_audit_events (target_type, target_id, created_at desc);

alter table public.platform_admins enable row level security;
alter table public.admin_audit_events enable row level security;

create or replace function private.is_platform_admin()
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
      from public.platform_admins
      where platform_admins.user_id = (select auth.uid())
        and platform_admins.is_active
    );
$$;

revoke all on function private.is_platform_admin()
from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;

create policy "Admins can read their own platform access"
on public.platform_admins
for select
to authenticated
using (user_id = (select auth.uid()) and is_active);

create policy "Platform admins can read audit events"
on public.admin_audit_events
for select
to authenticated
using (private.is_platform_admin());

create policy "Platform admins can read profiles"
on public.profiles
for select
to authenticated
using (private.is_platform_admin());

create policy "Platform admins can read organizations"
on public.organizations
for select
to authenticated
using (private.is_platform_admin());

create policy "Platform admins can read jobs"
on public.jobs
for select
to authenticated
using (private.is_platform_admin());

create policy "Platform admins can read applications"
on public.applications
for select
to authenticated
using (private.is_platform_admin());

revoke all on table public.platform_admins from anon, authenticated;
revoke all on table public.admin_audit_events from anon, authenticated;
grant select on table public.platform_admins to authenticated;
grant select on table public.admin_audit_events to authenticated;

create or replace function public.record_admin_audit_event(
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

revoke all on function public.record_admin_audit_event(
  text,
  text,
  uuid,
  jsonb
) from public, anon, authenticated;
grant execute on function public.record_admin_audit_event(
  text,
  text,
  uuid,
  jsonb
) to authenticated;

comment on table public.platform_admins is
  'Platform-wide administrator assignments, separate from organization roles.';
comment on table public.admin_audit_events is
  'Append-only audit events created by controlled privileged operations.';

