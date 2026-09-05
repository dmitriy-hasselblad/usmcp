-- Employer Claim lets an employer representative request control of an
-- existing public organization profile. Claims remain private until a
-- platform administrator reviews them.

create table public.organization_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  claimant_id uuid not null references public.profiles (id) on delete cascade,
  claimant_title text not null check (char_length(claimant_title) between 2 and 120),
  work_email text not null check (char_length(work_email) between 5 and 254),
  relationship text not null check (char_length(relationship) between 20 and 1500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) between 2 and 1000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'pending' and review_note is null and reviewed_by is null and reviewed_at is null)
    or (status in ('approved', 'rejected') and review_note is not null and reviewed_by is not null and reviewed_at is not null)
  )
);

create unique index organization_claims_one_pending_claim_idx
on public.organization_claims (organization_id)
where status = 'pending';

create index organization_claims_claimant_created_at_idx
on public.organization_claims (claimant_id, created_at desc);

create index organization_claims_status_created_at_idx
on public.organization_claims (status, created_at asc);

alter table public.organization_claims enable row level security;

create or replace function private.is_public_claimable_organization(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organizations
    join public.jobs on jobs.organization_id = organizations.id
    where organizations.id = target_organization_id
      and jobs.status = 'published'
      and jobs.moderation_status = 'approved'
      and (jobs.expires_at is null or jobs.expires_at > now())
  );
$$;

revoke all on function private.is_public_claimable_organization(uuid)
from public, anon, authenticated;
grant execute on function private.is_public_claimable_organization(uuid)
to authenticated;

create policy "Claimants can read their own organization claims"
on public.organization_claims
for select
to authenticated
using (claimant_id = (select auth.uid()));

create policy "Employer accounts can submit organization claims"
on public.organization_claims
for insert
to authenticated
with check (
  claimant_id = (select auth.uid())
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and review_note is null
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'employer'
      and profiles.onboarding_completed
  )
  and not exists (
    select 1
    from public.organization_members
    where organization_members.user_id = (select auth.uid())
  )
  and private.is_public_claimable_organization(organization_id)
);

create policy "Platform admins can read organization claims"
on public.organization_claims
for select
to authenticated
using (private.is_platform_admin());

revoke all on table public.organization_claims from public, anon, authenticated;
grant select, insert on table public.organization_claims to authenticated;

create or replace function private.review_organization_claim(
  target_claim_id uuid,
  target_status text,
  target_review_note text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  claim_record public.organization_claims%rowtype;
  normalized_note text := nullif(trim(target_review_note), '');
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;

  if target_status not in ('approved', 'rejected') then
    raise exception 'Unsupported claim review status.';
  end if;

  if coalesce(char_length(normalized_note), 0) < 2 or char_length(normalized_note) > 1000 then
    raise exception 'A review note between 2 and 1000 characters is required.';
  end if;

  select * into claim_record
  from public.organization_claims
  where id = target_claim_id
  for update;

  if claim_record.id is null then
    raise exception 'Claim not found.';
  end if;

  if claim_record.status <> 'pending' then
    raise exception 'Only pending claims can be reviewed.';
  end if;

  if target_status = 'approved' and exists (
    select 1 from public.organization_members
    where organization_members.user_id = claim_record.claimant_id
  ) then
    raise exception 'This representative already belongs to an organization workspace.';
  end if;

  update public.organization_claims
  set status = target_status,
      review_note = normalized_note,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = claim_record.id;

  if target_status = 'approved' then
    insert into public.organization_members (
      organization_id, user_id, role, position_title
    ) values (
      claim_record.organization_id,
      claim_record.claimant_id,
      'owner'::public.organization_member_role,
      claim_record.claimant_title
    );

    update public.employer_profiles
    set organization_id = claim_record.organization_id
    where user_id = claim_record.claimant_id;
  end if;

  perform private.record_admin_audit_event(
    'organization_claim.reviewed',
    'organization_claim',
    claim_record.id,
    jsonb_build_object(
      'organization_id', claim_record.organization_id,
      'claimant_id', claim_record.claimant_id,
      'status', target_status
    )
  );

  return target_status;
end;
$$;

revoke all on function private.review_organization_claim(uuid, text, text)
from public, anon, authenticated;

create or replace function public.review_organization_claim(
  target_claim_id uuid,
  target_status text,
  target_review_note text
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.review_organization_claim(
    target_claim_id,
    target_status,
    target_review_note
  );
$$;

revoke all on function public.review_organization_claim(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.review_organization_claim(uuid, text, text)
to authenticated;
