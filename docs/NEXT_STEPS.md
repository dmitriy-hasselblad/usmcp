# SM VIA Next Steps

Last updated: 2026-08-26

## Current product phase

**Phase 2: Marketplace MVP — functional delivery complete; preparing the
public launch baseline.**

The complete Early Access hiring loop works:

`Employer creates job -> job appears publicly -> professional applies -> employer reviews -> private messaging -> interview scheduling -> calendar/video interview`

The next work must complete Marketplace MVP before payments, messaging, or AI.

## Active delivery branch

**Branch:** `codex/aya-inspired-discovery`

The Aya Healthcare review identified four suitable Early Access adaptations:

1. Private candidate job preferences.
2. Private saved job searches and in-product alerts when a matching job is
   published.
3. Topic filters for the existing Career Resources library.
4. More structured job information where the existing marketplace model
   needs it.

The first three are implemented locally on this branch. The new
`saved_job_searches` table is owner-scoped by RLS and the database trigger
creates only private in-product notifications. Email alerts, salary guides,
employer testimonials, staffing operations, and predictive matching are not
part of this change.

The migration `candidate_job_discovery_alerts` has **not** been applied to
Production. It requires Preview verification and explicit product-owner
approval before that step.

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

**Delivery status:** Completed and verified in Production. The platform-admin authorization, secure
route, minimal metrics, audit-event foundation, read-only directories,
organization detail, the pending-verification queue, and atomic verification
actions are verified in Production through PR #16.
Job moderation is verified end to end through PR #18. User suspension,
blocked-access behavior, reactivation, restored access, and both audit events
are verified through PR #20.

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

## Priority 5: Early Access growth and trust preparation

Priorities 1-4 are stable. The product-owner decision for the initial launch is
a free Early Access pilot focused on building the employer and candidate base.
Payments are not a launch dependency.

1. Employer verification workflow
2. Email notifications (Resend delivery and branded templates verified in
   Production through PRs #62 and #63)
3. Candidate search and saved candidates
4. Employer team invitations
5. Organization News & Insights (merged through PR #26; Production verified
   with six public articles on 2026-08-08)
6. Abuse oversight and audit viewer (completed through PR #30)
7. Automated boundary tests, SEO, analytics, and soft-launch readiness

The source-level authorization suite, live RLS verification, public SEO
foundation, and consent-aware Vercel Web Analytics are complete through PRs
#31, #33, #34, and #35. The standalone résumé builder is complete through
PR #36 and verified in Production.

Stripe, subscriptions, one-time payments, invoices, and billing are deferred
until 6-12 months after Early Access. Preserve a clean future entitlement
boundary, but do not implement or prioritize payment functionality before then.

Resend domain verification, Preview testing, Production delivery, and branded
transactional templates are complete. Monitor inbox placement, bounces, and
spam complaints during Early Access.

## Scheduled authentication work

The product owner reactivated social sign-in on 2026-08-20. Deliver it as
two separate, security-reviewed changes:

1. **Google sign-in:** configure Supabase Google OAuth, preserve the existing
   account-type onboarding choice, and verify sign-in, sign-out, account
   linking, and failure states in Vercel Preview before Production.
2. **LinkedIn sign-in:** follow only after Google is verified. Confirm the
   current LinkedIn OAuth requirements and keep the same account-type and
   authorization boundaries.

Neither provider may grant roles or organization access from provider profile
data. SM VIA retains its own role, onboarding, membership, and RLS decisions.

## Deferred work

Do not start these areas yet unless the product owner explicitly changes the
roadmap:

- AI recruiter
- advanced candidate matching
- mobile application
- learning-management system
- international marketplace
- advanced analytics
- full Resume/CV Builder

## Immediate next ticket

**Ticket:** Formal soft-launch operations and search visibility.

### Goal

Prepare SM VIA for its first controlled public audience by connecting search
operations, monitoring transactional delivery, and documenting the operating
baseline without expanding product scope.

### Required scope

1. Connect `smvia.org` to Google Search Console and submit the live sitemap.
2. Confirm the Production canonical URL, `robots.txt`, and sitemap remain
   accessible to anonymous visitors.
3. Establish a lightweight weekly review of Resend delivery, bounces, and spam
   complaints while the Early Access audience grows.
4. Do not change Supabase schema or RLS.
5. Keep Google and LinkedIn sign-in, billing, and AI features deferred until
   their recorded launch decisions change.

### Explicit limitation

The custom-domain hardening ticket was completed through PR #61. The copied-
marketplace-content replacement was completed through PR #59: all public
demonstration organizations and jobs are clearly labelled and are excluded from
applications and JobPosting metadata. The geographic-reference ticket was
completed in PR #51. Employer funnel analytics and candidate application
analytics were completed in PRs #54 and #55.

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
