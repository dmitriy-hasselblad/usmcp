-- Organization-managed DNS verification. This supplements, but never replaces,
-- the platform-admin organization verification decision.

create table public.organization_domain_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  domain text not null unique check (
    char_length(domain) between 3 and 253
    and domain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'
  ),
  verification_token text not null unique check (char_length(verification_token) between 32 and 160),
  verified_at timestamptz,
  last_checked_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organization_domain_verifications_verified_at_idx
on public.organization_domain_verifications (verified_at desc nulls last);

create trigger organization_domain_verifications_set_updated_at
before update on public.organization_domain_verifications
for each row execute function private.set_updated_at();

alter table public.organization_domain_verifications enable row level security;

revoke all on table public.organization_domain_verifications from anon, authenticated;
grant select, insert, update on table public.organization_domain_verifications to authenticated;

create policy "Organization managers can read domain verification"
on public.organization_domain_verifications
for select to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner'::public.organization_member_role, 'admin'::public.organization_member_role]
  )
);

create policy "Organization managers can start domain verification"
on public.organization_domain_verifications
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.is_organization_member(
    organization_id,
    array['owner'::public.organization_member_role, 'admin'::public.organization_member_role]
  )
);

create policy "Organization managers can update domain verification"
on public.organization_domain_verifications
for update to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner'::public.organization_member_role, 'admin'::public.organization_member_role]
  )
)
with check (
  private.is_organization_member(
    organization_id,
    array['owner'::public.organization_member_role, 'admin'::public.organization_member_role]
  )
);
