-- Allow authorized hiring teams to permanently remove jobs that have no applications.
-- Jobs with applications remain protected by the existing foreign-key restriction.

create policy "Hiring team can delete jobs"
on public.jobs
for delete
to authenticated
using (
  private.is_organization_member(
    organization_id,
    array['owner', 'admin', 'recruiter']::public.organization_member_role[]
  )
);

grant delete on table public.jobs to authenticated;
