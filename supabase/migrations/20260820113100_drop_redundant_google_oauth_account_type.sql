-- Reuse the existing, identity-checked social OAuth account type function.
-- This removes the short-lived duplicate created during Google OAuth rollout.

drop function if exists public.set_initial_oauth_account_type(public.account_type);
