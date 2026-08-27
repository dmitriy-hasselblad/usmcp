-- Organization owners and admins already have an RLS policy for profile updates.
-- This adds the new logo_path column to the explicit column-level UPDATE grant.
grant update (logo_path) on table public.organizations to authenticated;
