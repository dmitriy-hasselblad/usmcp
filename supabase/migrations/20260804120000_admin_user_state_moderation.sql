create table public.account_moderation (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended')),
  reason text,
  moderated_at timestamptz,
  moderated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.account_moderation enable row level security;
revoke all on table public.account_moderation from public, anon;
grant select on table public.account_moderation to authenticated;

create or replace function private.is_account_active(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id is not null and coalesce(
    (select am.status = 'active' from public.account_moderation am where am.user_id = target_user_id),
    true
  );
$$;

revoke all on function private.is_account_active(uuid) from public, anon;
grant execute on function private.is_account_active(uuid) to authenticated;

create policy "Platform admins can read account moderation"
on public.account_moderation for select to authenticated
using (private.is_platform_admin());

create or replace function public.get_current_account_status()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case when private.is_account_active(auth.uid()) then 'active' else 'suspended' end;
$$;

revoke all on function public.get_current_account_status() from public, anon;
grant execute on function public.get_current_account_status() to authenticated;

create or replace function private.set_user_account_status(
  target_user_id uuid,
  target_status text,
  moderation_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  previous_status text;
begin
  if actor_id is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access required';
  end if;
  if target_status not in ('active', 'suspended') then raise exception 'Invalid account status'; end if;
  if target_user_id = actor_id then raise exception 'Administrators cannot moderate their own account'; end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then raise exception 'User not found'; end if;
  if target_status = 'suspended' and exists (
    select 1 from public.platform_admins where user_id = target_user_id and is_active
  ) then raise exception 'Active platform administrators cannot be suspended'; end if;
  if target_status = 'suspended' and length(trim(coalesce(moderation_reason, ''))) < 10 then
    raise exception 'A suspension reason of at least 10 characters is required';
  end if;
  if length(coalesce(moderation_reason, '')) > 1000 then raise exception 'Moderation reason is too long'; end if;

  select coalesce((select status from public.account_moderation where user_id = target_user_id for update), 'active')
    into previous_status;
  if previous_status = target_status then raise exception 'Account already has this status'; end if;

  insert into public.account_moderation (user_id, status, reason, moderated_at, moderated_by, updated_at)
  values (target_user_id, target_status, nullif(trim(moderation_reason), ''), now(), actor_id, now())
  on conflict (user_id) do update set status = excluded.status, reason = excluded.reason,
    moderated_at = excluded.moderated_at, moderated_by = excluded.moderated_by, updated_at = excluded.updated_at;

  perform private.record_admin_audit_event(
    'user.account_status_changed', 'user', target_user_id,
    jsonb_build_object('previous_status', previous_status, 'status', target_status, 'reason', nullif(trim(moderation_reason), ''))
  );
end;
$$;

revoke all on function private.set_user_account_status(uuid, text, text) from public, anon, authenticated;
grant execute on function private.set_user_account_status(uuid, text, text) to authenticated;

create or replace function public.set_user_account_status(target_user_id uuid, target_status text, moderation_reason text default null)
returns void language sql security invoker set search_path = ''
as $$ select private.set_user_account_status(target_user_id, target_status, moderation_reason); $$;

revoke all on function public.set_user_account_status(uuid, text, text) from public, anon;
grant execute on function public.set_user_account_status(uuid, text, text) to authenticated;
