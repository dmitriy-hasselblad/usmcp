-- Evaluate one permissive UPDATE policy per authenticated application request.

drop policy "Candidates can withdraw their applications"
on public.applications;

drop policy "Hiring teams can update application status"
on public.applications;

create policy "Candidates and hiring teams can update application status"
on public.applications
for update
to authenticated
using (
  (
    candidate_id = (select auth.uid())
    and status in ('submitted', 'reviewing', 'interview', 'offer')
  )
  or private.is_organization_member(
      organization_id,
      array['owner', 'admin', 'recruiter']::public.organization_member_role[]
    )
)
with check (
  (
    candidate_id = (select auth.uid())
    and status = 'withdrawn'
  )
  or (
    private.is_organization_member(
      organization_id,
      array['owner', 'admin', 'recruiter']::public.organization_member_role[]
    )
    and status in ('submitted', 'reviewing', 'interview', 'offer', 'rejected')
  )
);
