-- Preserve the account type selected before a new Google OAuth account is created.
-- The function can only affect the signed-in user's incomplete profile.

create or replace function public.set_initial_oauth_account_type(
  requested_account_type public.account_type
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set account_type = requested_account_type
  where id = (select auth.uid())
    and onboarding_completed = false;

  if not found then
    raise exception 'The account type can only be set during onboarding.';
  end if;
end;
$$;

revoke all on function public.set_initial_oauth_account_type(public.account_type) from public, anon;
grant execute on function public.set_initial_oauth_account_type(public.account_type) to authenticated;
