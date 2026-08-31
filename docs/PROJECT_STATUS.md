# SM VIA Project Status

Last updated: 2026-08-28

## Latest handoff — 2026-08-28

The product owner confirmed that PR #85 has been merged and that its Production
deployment is ready. The implementation delivers a branded transactional email
to every eligible organization owner, admin, and recruiter when a candidate
submits a new application. The email includes the candidate and role context
and a secure button that opens the relevant application in the employer
workspace. Delivery is intentionally server-only, recipient selection is based
on authorized organization membership, and the sending path is idempotent.

The immediately preceding application-document work is also live: candidates
can select a saved SM VIA CV or uploaded résumé and, optionally, a saved or
uploaded cover letter while applying. The employer receives only the documents
explicitly selected for that application.

For the next session, start by switching to `main`, pulling the merged work,
and checking the working tree. Do not delete the untracked local diagnostic
file `tmp-diagnostics-hiring-email.sql`; it was created only for the completed
email investigation and should be reviewed before any cleanup. Continue with
the next product-owner request rather than reopening the completed employer
new-application email feature.

## Purpose

This file is the durable handoff document for the SM VIA codebase. Read it before
starting work from a new computer, a new Codex task, or a new development branch.

SM VIA is the public product brand. The product is built
for the United States, and all user-facing website content must remain in
English.

## Authoritative project locations

- GitHub repository: https://github.com/dmitriy-hasselblad/usmcp
- Production: https://smvia.org
- Vercel project: `dmitriy-hasselblads-projects/usmcp`
- Supabase project reference: `zrruypidnjhtsqhjhlxn`
- Supabase region: `us-east-1`
- Product blueprint source: `USHCE_Healthcare_Career_Ecosystem_Product_Blueprint_RU.pdf`
  - The PDF is currently stored outside this repository.
  - Do not assume it is available on a new workstation.

## Production baseline

- Production branch: `main`
- Latest confirmed product Pull Request: PR #63
- PR #63 merge commit: `4854a0c`
- Current `main` commit at branch handoff: `4854a0c`
- Production deployment status at verification: `Ready`
- Latest Production verification date: 2026-08-19

PR #62 enabled Resend-backed transactional delivery for application status
changes and employer messages. PR #63 introduced the branded SM VIA email
layout. Both message types were verified in Preview and Production on
2026-08-19; delivery uses `notifications@smvia.org` and Production mode is
live. Inbox placement was confirmed after DMARC was added to the domain.

PRs #37 through #55 completed Early Access hiring-loop refinements: recommended
jobs; candidate discovery and saved candidates; employer invitations; News &
Insights self-service publishing and public contact details; the expanded U.S.
healthcare profession taxonomy; in-product notifications; private messaging,
attachments, interviews, calendar downloads, and LiveKit video rooms;
consent-aware funnel analytics; safe platform-demonstration labels; and a
five-minute reconnect window for completed video interviews. PR #50 refreshed
the roadmap handoff; PR #51 added shared U.S. state and city guidance with a
manual city path; PR #52 clarified platform demonstrations and Early Access
positioning; PR #53 documented public verification rules; PR #54 added
privacy-safe employer hiring insights; and PR #55 added private candidate
application insights. PR #55 was verified in Production on 2026-08-14.

The structured professional profile was verified in Production with a 100%
completion state and records in all four categories.

Public organization profiles and complete job filters were merged in PR #11
and verified in Production on 2026-07-31.

Candidate skills and extended profiles were stabilized in PR #12. Vercel
Preview, candidate flows, authorized hiring-team access, unrelated-employer and
anonymous denial, migrations, RLS, the merge, and the resulting Production
deployment were verified on 2026-08-03.

PR #32 added publication dates to live job cards and was verified in Production
on 2026-08-08. Product-preview cards intentionally remain without a publication
date. PR #33 records the live, read-only RLS boundary verification. PR #34
added the public SEO foundation: canonical metadata, social metadata,
`robots.txt`, dynamic sitemap coverage, and `JobPosting` structured data for
live vacancies. PR #34 was verified and deployed to Production on 2026-08-08.

PR #35 enabled consent-aware Vercel Web Analytics and was verified in
Production. PR #36 added the standalone U.S. healthcare résumé builder and
was verified in Production on 2026-08-10: professionals can create up to ten
private blank drafts, save them, and export a U.S. Letter-size PDF. Résumé
content is not copied from a profile and is private to its owner.

## Technology stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui and Radix UI
- Supabase Auth, PostgreSQL, Row Level Security, and Storage
- Vercel deployments connected to GitHub
- pnpm package manager

## Implemented product areas

### Public website

- SM VIA branding and English-only marketing content
- Responsive site header and footer
- Auth-aware public header
- Homepage and hero job search
- Public jobs listing
- Public job details
- Complete Blueprint job filters with shareable URLs and empty states
- Live Supabase-backed healthcare organization directory and profile pages
- For Employers page
- Career Resources page
- Privacy Policy
- Cookie Notice and granular cookie choices

### Authentication and onboarding

- Email/password sign-up
- Email/password sign-in
- Sign-out
- Email confirmation route
- Password reset and password update
- Role-based onboarding
- Professional and employer/recruiter account types
- Persistent Supabase session across public and dashboard pages

### Employer workspace

- Organization registration and membership
- Organization profile management
- Employer dashboard
- Job creation
- Draft and published job states
- Job listing management
- Publishing employer jobs to the public marketplace
- Applicant list
- Applicant detail
- Hiring status changes
- Structured candidate career history in applicant review

### Professional workspace

- Professional dashboard
- Professional profile
- Secure resume and supporting-document upload
- Private document download
- Active resume selection
- Job application submission
- Candidate application list
- Candidate application detail
- Application withdrawal
- Career History with:
  - education and clinical training;
  - professional experience;
  - licenses;
  - certifications;
  - create, edit, and remove actions;
  - profile completion calculation.
- Standalone U.S. healthcare résumé builder with private blank drafts,
  ATS-friendly preview, save/delete actions, and Early Access PDF export.

### Privacy and security foundation

- Supabase Row Level Security
- Role-aware server-side access checks
- Private professional records by default
- Employer access to candidate data through authorized applications
- Secure document ownership checks
- Consolidated public-job and application policies
- Cookie consent controls
- Platform-admin assignments separated from organization membership
- Secure server-side `/admin` authorization boundary
- RLS-protected privileged audit-event foundation
- Live RLS boundary verification completed on 2026-08-08 using read-only,
  rolled-back transactions with simulated authenticated claims. Candidate,
  authorized hiring-team, active-admin, and unrelated-user access behaved as
  intended for applications, professional documents, and admin records.

### Current Admin delivery status

- Priority 4 authorization foundation was merged through PR #14 and verified
  in Production on 2026-08-03.
- Database role-boundary checks confirmed that a platform administrator can
  read admin-scoped data while a normal authenticated user cannot.
- Read-only Admin Users and Organizations directories are implemented on
  `codex/admin-directory`, merged through PR #15, and verified in Production on
  2026-08-03.
- The directories include server-side search, pagination, responsive tables,
  and explicit empty and error states without exposing Auth credentials.
- Organization detail, the pending-verification queue, and atomic verification
  actions were merged through PR #16 and verified end to end in Production on
  2026-08-03. The USMCP organization changed from `unverified` to `verified`,
  the public/admin result was confirmed, and the corresponding privileged audit
  event was confirmed in Supabase.
- Admin job directory, moderation detail, and marketplace visibility controls
  were merged through PR #18 and verified end to end in Production on
  2026-08-04. The `Test` job moved from `approved` to `under_review` and
  disappeared from the public view, then returned to `approved` and public
  visibility. Both privileged audit events were confirmed in Supabase.
- Admin user-state moderation was merged through PR #20 and verified end to
  end in Preview and Production on 2026-08-04. A non-admin test user moved
  from `active` to `suspended`, was denied protected application access, then
  returned to `active` with Dashboard access restored. Both transitions and
  their reasons were confirmed in the privileged Supabase audit log.
- The server-only application-status email boundary was merged through PR #23.
  It is disabled by default and does not send Production email without an
  explicit delivery mode and server-side provider configuration.
- Candidate Search and Saved Candidates were merged through PR #24 and verified
  end to end in Production on 2026-08-05 as both a professional and employer.
- Employer team invitations and access administration are implemented on
  `codex/employer-team-invitations`, merged through PR #25, and verified in
  Production on 2026-08-05. Correct Production links and successful acceptance
  by a second employer account were confirmed.
- Organization News & Insights was merged through PR #26. Vercel Preview
  verification on
  2026-08-05 confirmed employer draft creation and editing, a 7 MB cover image,
  review submission, admin approval, public article/image rendering, and
  blocked-content exclusion. Production verification was confirmed on
  2026-08-08 with six published articles visible on the public website.
- News publication dates, year/month archive filters, and server-side archive
  pagination were merged through PR #27. Vercel Preview
  verification on 2026-08-07 confirmed live dates, the four-article August
  2026 filter, URL persistence, and an empty-period state. Production
  verification was confirmed on 2026-08-08 with live dates and archive filters
  working across six public articles.
- Admin Audit Log Viewer was merged through PR #29 and verified in Production
  on 2026-08-07. It provides admin-only search, action/target/date filters, and
  pagination over append-only privileged events.
- Abuse reporting and admin oversight were merged through PR #30 and verified
  in Production on 2026-08-07. Signed-in users can report public jobs,
  organizations, and News content; platform administrators can resolve or
  dismiss reports with corresponding audit events.

## Supabase migrations

The repository currently contains these applied migration groups:

1. Employer workspace
2. Employer workspace indexes
3. Public job marketplace
4. Public job policy consolidation
5. Candidate applications
6. Application update policy consolidation
7. Professional profiles and documents
8. Structured professional career profile
9. Restricted public organization and published-job views
10. Complete job-filter fields and public view updates
11. Candidate extended profile, structured skills, and private photos
12. Platform-admin authorization and privileged audit-event foundation
13. Atomic organization-verification moderation
14. Atomic job-visibility moderation
15. Atomic user-state moderation
16. Candidate discovery opt-in, organization-scoped saved candidates, and
    hardened search boundary
17. Employer team invitations, membership administration, and last-owner
    protection
18. Organization-authored news, private cover images, and moderation boundary
19. Public-content reporting, private reporter details, admin review decisions,
    and privileged audit events
20. Private standalone professional résumé drafts and owner-only export access
21. Social OAuth account-type support (Google provider configuration deferred)
22. Self-service organization News publishing and public contact details
23. In-product notifications
24. Private application messaging and attachments
25. Private application interview scheduling and video-room session expiry

Migration files are stored in `supabase/migrations/`.

Never add generated user, organization, job, application, or credential IDs to
schema migrations. Migrations must be reusable in a clean environment.

## Known gaps

The following areas are not complete:

- The standalone résumé builder is implemented and verified in Production.
  AI-assisted résumé writing remains deferred.
- Google and LinkedIn authentication are not implemented.
- Employer verification and manual moderation are implemented and verified in
  Production.
- The scoped Basic Admin Panel is in Production: authorization, metrics,
  directories, organization verification, job moderation, user suspension and
  reactivation, and privileged audit events.
- Stripe payments, subscriptions, invoices, and billing are intentionally
  deferred until 6-12 months after Early Access. The initial launch will use a
  free pilot model focused on building the employer and candidate base.
- Resend transactional email delivery is live for application-status changes
  and employer messages. The domain is verified, DMARC is configured, and the
  branded layouts were confirmed in Production on 2026-08-19. Monitor inbox
  placement, bounces, and spam complaints during Early Access.
- Messaging, in-product notifications, private message attachments, interview
  scheduling, calendar downloads, and LiveKit video rooms are implemented and
  verified in Production through PR #49.
- AI features are intentionally deferred.
- The shared U.S. geography helper is live in candidate and employer forms:
  users select a state, may select a suggested city, and may always enter a
  different legitimate U.S. city manually. Existing stored locations and
  public search URLs remain compatible.
- Hiring insights are live for employer workspaces and application insights
  are live for professional workspaces. Both reports use only role-authorized
  application records and do not introduce visitor tracking or new schema.
- Public SEO foundation and consent-aware Vercel Web Analytics are implemented.
  Wider soft-launch operations remain in progress.
- The source-level access contract suite is in place. Fully automated database
  integration coverage requires an isolated Supabase Branch (available on Pro)
  or a local Docker/Supabase CLI environment; neither is currently available.
- The domain `smvia.org` and `www.smvia.org` are connected to Production. The
  Production public site URL is configured as `https://smvia.org` in Vercel and
  Supabase Auth URL Configuration was updated on 2026-08-18.
- Candidate job preferences, private saved searches, and in-product job-match
  alerts are in active development on `codex/aya-inspired-discovery`. The
  related migration was applied to Production on 2026-08-26; the feature still
  requires Vercel Preview verification before a pull request is merged.

## Local workstation setup

Clone the repository on a new computer:

```powershell
git clone https://github.com/dmitriy-hasselblad/usmcp.git
cd usmcp
pnpm install
```

Required local configuration is documented in `.env.example`.

`.env.local` is intentionally ignored by Git and must never be committed. Link
the local folder to Vercel and pull Development environment variables, or obtain
the public Supabase values from the authorized dashboards:

```powershell
vercel login
vercel link
vercel env pull .env.local
```

Do not add passwords, access tokens, service-role keys, private signing keys, or
user credentials to this repository or these documentation files.

## Development workflow

At the beginning of a work session:

```powershell
git switch main
git pull
git switch -c agent/<short-feature-name>
```

At the end of a work session:

1. Review `git status` and the complete diff.
2. Run relevant checks.
3. Commit only the intended files.
4. Push the feature branch.
5. Verify the Vercel Preview deployment.
6. Test the complete user flow.
7. Open and merge a Pull Request only after verification.
8. Confirm the resulting Production deployment.
9. Update these handoff documents when scope or priorities change.

Do not develop directly on `main`.

## Product-owner deferral register

When reporting remaining work, always include these explicit decisions:

1. **Email delivery / Resend:** live for application-status changes and
   employer messages through `notifications@smvia.org`. Monitor delivery
   health during Early Access; do not use this transactional channel for bulk
   marketing.
2. **Payments and billing:** Stripe, subscriptions, job-posting payments,
   invoices, billing portal, and webhooks are deferred until 6-12 months after
   Early Access launch. The initial pilot remains free.
3. **Google and LinkedIn sign-in:** provider configuration and final browser
   verification are deferred until the final pre-launch pass.
4. **Marketplace sample content:** this replacement was completed in PR #59.
   Public demonstration organizations and jobs are fully synthetic, clearly
   labelled, and excluded from applications and JobPosting metadata.

## Verification standard

A feature is not complete merely because the page renders. Verification must
cover the complete boundary:

1. User interface action
2. Server action or route
3. Supabase record or storage object
4. Row Level Security and authorization
5. Result visible to the correct user role
6. Vercel Preview deployment
7. Production deployment after approved merge

## Continuation prompt

Use this prompt when opening the repository in a new Codex task:

> Read `docs/PROJECT_STATUS.md`, `docs/BLUEPRINT_ROADMAP.md`, and
> `docs/NEXT_STEPS.md`. Check the current Git branch and working tree. Continue
> from the first incomplete priority in `NEXT_STEPS.md`. Keep all user-facing
> site content in English. Verify in Preview before proposing a Production
> merge.
