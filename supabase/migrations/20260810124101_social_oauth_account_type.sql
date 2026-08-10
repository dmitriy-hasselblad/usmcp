-- A social OAuth identity does not carry the USHCE account type selected before
-- redirecting to its provider. This function allows that one pre-onboarding
-- selection to be persisted only by the authenticated social user themselves.
create or replace function public.set_initial_social_account_type(
  target_account_type public.account_type
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from auth.identities
    where user_id = current_user_id
      and provider in ('google', 'linkedin_oidc')
  ) then
    raise exception 'A Google or LinkedIn identity is required.' using errcode = '42501';
  end if;

  update public.profiles
  set account_type = target_account_type
  where id = current_user_id
    and onboarding_completed = false;

  if not found then
    raise exception 'Account type can only be selected before onboarding is completed.' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.set_initial_social_account_type(public.account_type) from public, anon;
grant execute on function public.set_initial_social_account_type(public.account_type) to authenticated;
