-- Copyable, single-use employer team invitations. Email delivery remains
-- intentionally out of scope for Early Access.

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254 and email = lower(email)),
  role public.organization_member_role not null check (role <> 'owner'),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  invited_by uuid not null references public.profiles (id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > created_at),
  check ((accepted_at is null) = (accepted_by is null))
);

create index organization_invitations_organization_created_idx
on public.organization_invitations (organization_id, created_at desc);

create unique index organization_invitations_active_email_idx
on public.organization_invitations (organization_id, email)
where accepted_at is null and revoked_at is null;

create trigger organization_invitations_set_updated_at
before update on public.organization_invitations
for each row execute function private.set_updated_at();

alter table public.organization_invitations enable row level security;

create policy "Organization managers can read invitations"
on public.organization_invitations for select to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can create invitations"
on public.organization_invitations for insert to authenticated
with check (
  invited_by = (select auth.uid())
  and role <> 'owner'
  and private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can revoke invitations"
on public.organization_invitations for update to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
)
with check (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create policy "Organization managers can remove membership"
on public.organization_members for delete to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  )
);

create or replace function private.protect_last_organization_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'owner'
    and (tg_op = 'DELETE' or new.role <> 'owner')
    and not exists (
      select 1 from public.organization_members
      where organization_id = old.organization_id
        and user_id <> old.user_id
        and role = 'owner'
    ) then
    raise exception 'Every organization must retain at least one owner.';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_last_organization_owner() from public, anon, authenticated;

create trigger organization_members_protect_last_owner
before update of role or delete on public.organization_members
for each row execute function private.protect_last_organization_owner();

create or replace function public.accept_organization_invitation(invitation_token_hash text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  invitation public.organization_invitations%rowtype;
begin
  if current_user_id is null then raise exception 'Authentication is required.'; end if;
  if invitation_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'The invitation is invalid.'; end if;

  select lower(users.email) into current_email from auth.users where users.id = current_user_id;
  if not exists (
    select 1 from public.profiles
    where id = current_user_id and account_type = 'employer' and onboarding_completed
  ) then
    raise exception 'Complete an employer profile before accepting this invitation.';
  end if;

  select * into invitation from public.organization_invitations
  where token_hash = invitation_token_hash for update;

  if invitation.id is null or invitation.revoked_at is not null
    or invitation.accepted_at is not null or invitation.expires_at <= now()
    or invitation.email <> current_email then
    raise exception 'This invitation is unavailable for the signed-in account.';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (invitation.organization_id, current_user_id, invitation.role)
  on conflict (organization_id, user_id) do update set role = excluded.role
  where organization_members.role <> 'owner';

  update public.employer_profiles set organization_id = invitation.organization_id
  where user_id = current_user_id;

  update public.organization_invitations
  set accepted_at = now(), accepted_by = current_user_id
  where id = invitation.id;

  return invitation.organization_id;
end;
$$;

revoke all on function public.accept_organization_invitation(text) from public, anon, authenticated;
grant execute on function public.accept_organization_invitation(text) to authenticated;

revoke all on table public.organization_invitations from anon, authenticated;
grant select on table public.organization_invitations to authenticated;
grant insert (organization_id, email, role, token_hash, invited_by, expires_at)
on table public.organization_invitations to authenticated;
grant update (revoked_at) on table public.organization_invitations to authenticated;
grant delete on table public.organization_members to authenticated;
