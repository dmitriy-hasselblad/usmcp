-- Employer workspace polish: public organization logos, an append-only
-- organization activity stream, and protection against reopening jobs with
-- existing applications as drafts.

alter table public.organizations
add column if not exists logo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-logos',
  'organization-logos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Organization managers can read organization logos"
on storage.objects for select to authenticated
using (
  bucket_id = 'organization-logos'
  and name ~ '^[0-9a-fA-F-]{36}/'
  and private.is_organization_member(
    ((storage.foldername(name))[1])::uuid,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can upload organization logos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'organization-logos'
  and name ~ '^[0-9a-fA-F-]{36}/'
  and private.is_organization_member(
    ((storage.foldername(name))[1])::uuid,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can delete organization logos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'organization-logos'
  and name ~ '^[0-9a-fA-F-]{36}/'
  and private.is_organization_member(
    ((storage.foldername(name))[1])::uuid,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create table public.organization_activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in (
    'organization.profile_updated',
    'team.member_added',
    'team.member_role_updated',
    'team.member_removed',
    'team.invitation_created',
    'team.invitation_revoked'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organization_activity_events_organization_created_idx
on public.organization_activity_events (organization_id, created_at desc);

alter table public.organization_activity_events enable row level security;
revoke all on table public.organization_activity_events from anon, authenticated;
grant select on table public.organization_activity_events to authenticated;

create policy "Organization members can read organization activity"
on public.organization_activity_events for select to authenticated
using (private.is_organization_member(organization_id));

create or replace function private.record_organization_activity_event(
  target_organization_id uuid,
  event_action text,
  event_metadata jsonb default '{}'::jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    return;
  end if;

  insert into public.organization_activity_events (
    organization_id, actor_user_id, action, metadata
  ) values (
    target_organization_id, (select auth.uid()), event_action, coalesce(event_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function private.record_organization_activity_event(uuid, text, jsonb)
from public, anon, authenticated;

create or replace function private.log_organization_profile_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new is distinct from old then
    perform private.record_organization_activity_event(new.id, 'organization.profile_updated');
  end if;
  return new;
end;
$$;

create or replace function private.log_organization_member_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_id uuid := coalesce(new.organization_id, old.organization_id);
begin
  if tg_op = 'INSERT' then
    perform private.record_organization_activity_event(target_id, 'team.member_added', jsonb_build_object('member_user_id', new.user_id, 'role', new.role));
  elsif tg_op = 'DELETE' then
    perform private.record_organization_activity_event(target_id, 'team.member_removed', jsonb_build_object('member_user_id', old.user_id, 'role', old.role));
  elsif old.role is distinct from new.role then
    perform private.record_organization_activity_event(target_id, 'team.member_role_updated', jsonb_build_object('member_user_id', new.user_id, 'previous_role', old.role, 'role', new.role));
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function private.log_organization_invitation_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.record_organization_activity_event(new.organization_id, 'team.invitation_created', jsonb_build_object('email', new.email, 'role', new.role));
  elsif old.revoked_at is null and new.revoked_at is not null then
    perform private.record_organization_activity_event(new.organization_id, 'team.invitation_revoked', jsonb_build_object('email', new.email));
  end if;
  return new;
end;
$$;

revoke all on function private.log_organization_profile_update() from public, anon, authenticated;
revoke all on function private.log_organization_member_activity() from public, anon, authenticated;
revoke all on function private.log_organization_invitation_activity() from public, anon, authenticated;

create trigger organizations_log_profile_update
after update on public.organizations
for each row execute function private.log_organization_profile_update();

create trigger organization_members_log_activity
after insert or update or delete on public.organization_members
for each row execute function private.log_organization_member_activity();

create trigger organization_invitations_log_activity
after insert or update on public.organization_invitations
for each row execute function private.log_organization_invitation_activity();

-- A job with any hiring history must remain closed. It can be replaced with a
-- fresh draft, but reopening it would make a historical application appear to
-- belong to a new opening.
update public.jobs
set status = 'closed', published_at = null, open_positions = 0
where status = 'draft'
  and exists (
    select 1 from public.applications
    where applications.job_id = jobs.id
  );

create or replace function private.prevent_draft_with_application_history()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'draft'
    and exists (select 1 from public.applications where applications.job_id = new.id) then
    raise exception 'Jobs with applications cannot be reopened as drafts. Create a new job for a future opening.';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_draft_with_application_history() from public, anon, authenticated;

create trigger jobs_prevent_draft_with_application_history
before update of status on public.jobs
for each row execute function private.prevent_draft_with_application_history();

create or replace view public.published_jobs
with (security_invoker = true)
as
select
  jobs.id, jobs.slug, jobs.title, jobs.specialty, jobs.city, jobs.state_code,
  jobs.employment_type, jobs.workplace_type, jobs.salary_min, jobs.salary_max,
  jobs.salary_period, jobs.visa_support, jobs.description, jobs.published_at,
  jobs.created_at, organizations.id as organization_id,
  organizations.name as organization_name, organizations.slug as organization_slug,
  organizations.organization_type, organizations.state_code as organization_state_code,
  organizations.description as organization_description,
  organizations.website as organization_website, organizations.verification_status,
  jobs.profession, jobs.experience_level, jobs.required_skills, jobs.expires_at,
  jobs.open_positions, organizations.logo_path as organization_logo_path
from public.jobs
join public.organizations on organizations.id = jobs.organization_id
where jobs.status = 'published'
  and jobs.moderation_status = 'approved'
  and jobs.expires_at > now()
  and jobs.open_positions > 0;

revoke all on table public.published_jobs from public, anon, authenticated;
grant select (logo_path) on table public.organizations to anon, authenticated;
grant select on table public.published_jobs to anon, authenticated;
