# USHCE Next Steps

Last updated: 2026-08-03

## Current product phase

**Phase 2: Marketplace MVP**

The core hiring loop works:

`Employer creates job -> job appears publicly -> professional applies -> employer reviews application`

The next work must complete Marketplace MVP before payments, messaging, or AI.

## Priority 1: Live public organization profiles

**Delivery status:** Completed and verified in Production through PR #11.

### Goal

Replace the fictional organization preview experience with real,
Supabase-backed public organization pages.

### Required scope

- Create a public route such as `/companies/[slug]`.
- Load only approved public organization fields.
- Display:
  - organization name;
  - type;
  - description;
  - website;
  - location;
  - verification state;
  - published jobs.
- Link organization names from job cards and job details.
- Make `/companies` use live data.
- Keep preview/sample data clearly separated or remove it.
- Add safe public-read policies or a restricted public view.
- Do not expose organization members, private contact data, or internal notes.

### Acceptance criteria

- A real employer organization appears in the public directory.
- Its public page opens by stable slug.
- Only published jobs appear.
- A candidate can move from organization page to job detail and application.
- Private organization fields cannot be read anonymously.
- Empty and unknown organization states are handled.
- Mobile and desktop layouts are verified.
- Supabase data and RLS behavior are verified.
- Vercel Preview build and browser flow are verified.

## Priority 2: Complete job search filters

**Delivery status:** Completed and verified in Production through PR #11.

### Required scope

- Profession
- Specialty
- State
- City or location query
- Employment type
- Workplace type
- Experience level
- Salary range
- Visa-support option
- Clear-all action
- URL-persisted filters
- Empty-results state

### Acceptance criteria

- Filters work with live Supabase jobs.
- Multiple filters combine correctly.
- Filter URLs are shareable.
- Public results contain only published jobs.
- Mobile filter experience is usable.

## Priority 3: Candidate skills and extended profile

**Delivery status:** Completed and verified in Production through PR #12.

### Required scope

- Structured skills
- Languages
- Professional summary
- Optional professional photo
- Profile visibility controls
- Completion calculation updated for the expanded model
- Employer view updated only for authorized applications

### Acceptance criteria

- Candidate can add, edit, and remove structured skills.
- Duplicate skills are prevented.
- Private profile data remains inaccessible to unrelated employers.
- Applicant review displays authorized candidate data clearly.

## Priority 4: Basic Admin Panel

**Delivery status:** In progress. The platform-admin authorization, secure
route, minimal metrics, audit-event foundation, read-only directories,
organization detail, the pending-verification queue, and atomic verification
actions are verified in Production through PR #16.

### Required scope

- Platform-admin role separate from organization admin
- Secure admin route group
- User list
- Organization list
- Employer verification queue
- Job moderation
- Suspend/reactivate controls
- Minimal dashboard metrics
- Audit events for privileged actions

### Acceptance criteria

- Non-admin users cannot access admin routes or data.
- Every moderation action records actor, target, action, and timestamp.
- Destructive actions require clear confirmation.
- Verification changes appear correctly on public organization profiles.

## Priority 5: Trust and Revenue preparation

Start only after Priorities 1-4 are stable:

1. Employer verification workflow
2. Email notifications
3. Stripe product and price model
4. Subscription entitlements
5. One-time job-posting payments
6. Billing portal and webhook processing

## Deferred work

Do not start these areas yet unless the product owner explicitly changes the
roadmap:

- AI recruiter
- advanced candidate matching
- mobile application
- native video calls
- learning-management system
- international marketplace
- advanced analytics
- full Resume/CV Builder

## Immediate next ticket

**Ticket:** Continue Priority 4 with narrowly scoped job moderation.

**Delivery branch:** Create a new feature branch from updated `main` after this
Production handoff is merged.

**Implementation order:**

1. Review the existing job schema, migrations, publication policies, and RLS
   before changing the database.
2. Add an admin job directory and moderation detail view with clear status
   filters and empty/error states.
3. Define the smallest necessary moderation actions without disrupting the
   employer draft/published workflow.
4. Require explicit confirmation for destructive or visibility-changing
   actions.
5. Validate platform-admin access and write the actor, target, action, and
   timestamp atomically to the privileged audit log.
6. Verify employer, public marketplace, and admin results in Vercel Preview
   before requesting a Production merge.

## Definition of done for every future stage

A stage is complete only when:

- requirements are mapped to a Blueprint item;
- data model and RLS are reviewed;
- implementation is reusable and responsive;
- user-facing content is English;
- empty, error, and unauthorized states are covered;
- local checks or Vercel build checks pass;
- Preview is tested end to end;
- the product owner approves Production publication;
- the Production deployment is confirmed;
- these documentation files are updated.

## Prompt for a new workstation

> Read `docs/PROJECT_STATUS.md`, `docs/BLUEPRINT_ROADMAP.md`, and
> `docs/NEXT_STEPS.md`. Check `git status`, confirm that `main` is current, and
> review the current Priority 1 and 2 delivery branch, then continue with the
> first incomplete stage. Do not
> change Supabase schema before inspecting the existing migrations and RLS. Keep
> all website content in English. Verify the entire flow in Vercel Preview
> before requesting a Production merge.
