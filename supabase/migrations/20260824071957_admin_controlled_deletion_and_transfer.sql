-- Platform-admin account transfer and controlled destructive actions.
-- A target administrator must already have a confirmed Auth account and profile.

do $$
declare
  target_user_id uuid;
begin
  select users.id
  into target_user_id
  from auth.users as users
  join public.profiles as profiles on profiles.id = users.id
  where lower(users.email) = 'admin@smvia.org'
  limit 1;

  if target_user_id is null then
    raise exception 'Create and confirm the admin@smvia.org account before applying this migration.';
  end if;

  update public.platform_admins
  set is_active = false,
      note = 'Superseded by the SM VIA platform administrator account.'
  where is_active
    and user_id <> target_user_id;

  insert into public.platform_admins (user_id, granted_by, is_active, note)
  values (
    target_user_id,
    target_user_id,
    true,
    'Primary SM VIA platform administrator.'
  )
  on conflict (user_id) do update
  set is_active = true,
      note = excluded.note;
end;
$$;

create or replace function private.delete_job_as_platform_admin(target_job_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_job public.jobs%rowtype;
begin
  if actor_id is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  select * into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found.';
  end if;

  if exists (select 1 from public.applications where job_id = target_job_id) then
    raise exception 'Jobs with applications cannot be permanently deleted.';
  end if;

  delete from public.jobs where id = target_job_id;

  insert into public.admin_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (
    actor_id,
    'job.permanently_deleted',
    'job',
    target_job_id,
    jsonb_build_object('organization_id', target_job.organization_id, 'title', target_job.title)
  );
end;
$$;

create or replace function public.delete_job_as_platform_admin(target_job_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.delete_job_as_platform_admin(target_job_id);
$$;

revoke all on function private.delete_job_as_platform_admin(uuid) from public, anon, authenticated;
grant execute on function private.delete_job_as_platform_admin(uuid) to authenticated;
revoke all on function public.delete_job_as_platform_admin(uuid) from public, anon, authenticated;
grant execute on function public.delete_job_as_platform_admin(uuid) to authenticated;

create or replace function private.delete_organization_as_platform_admin(target_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_organization public.organizations%rowtype;
  deleted_job_count integer := 0;
begin
  if actor_id is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  select * into target_organization
  from public.organizations
  where id = target_organization_id
  for update;

  if not found then
    raise exception 'Organization not found.';
  end if;

  if exists (select 1 from public.applications where organization_id = target_organization_id) then
    raise exception 'Organizations with applications cannot be permanently deleted.';
  end if;

  select count(*) into deleted_job_count
  from public.jobs
  where organization_id = target_organization_id;

  delete from public.organizations where id = target_organization_id;

  insert into public.admin_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (
    actor_id,
    'organization.permanently_deleted',
    'organization',
    target_organization_id,
    jsonb_build_object('name', target_organization.name, 'deleted_job_count', deleted_job_count)
  );
end;
$$;

create or replace function public.delete_organization_as_platform_admin(target_organization_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.delete_organization_as_platform_admin(target_organization_id);
$$;

revoke all on function private.delete_organization_as_platform_admin(uuid) from public, anon, authenticated;
grant execute on function private.delete_organization_as_platform_admin(uuid) to authenticated;
revoke all on function public.delete_organization_as_platform_admin(uuid) from public, anon, authenticated;
grant execute on function public.delete_organization_as_platform_admin(uuid) to authenticated;
