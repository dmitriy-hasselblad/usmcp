# USHCE Project Status

Last updated: 2026-08-03

## Purpose

This file is the durable handoff document for the USHCE codebase. Read it before
starting work from a new computer, a new Codex task, or a new development branch.

USHCE stands for **The U.S. Healthcare Career Ecosystem**. The product is built
for the United States, and all user-facing website content must remain in
English.

## Authoritative project locations

- GitHub repository: https://github.com/dmitriy-hasselblad/usmcp
- Production: https://usmcp.vercel.app
- Vercel project: `dmitriy-hasselblads-projects/usmcp`
- Supabase project reference: `zrruypidnjhtsqhjhlxn`
- Supabase region: `us-east-1`
- Product blueprint source: `USHCE_Healthcare_Career_Ecosystem_Product_Blueprint_RU.pdf`
  - The PDF is currently stored outside this repository.
  - Do not assume it is available on a new workstation.

## Production baseline

- Production branch: `main`
- Latest confirmed product Pull Request: PR #15
- PR #15 merge commit: `4f5a97674f59c442e7ba718ec64c4757b2095713`
- Current `main` commit: `4f5a97674f59c442e7ba718ec64c4757b2095713`
- Production deployment status at verification: `Ready`
- Latest Production verification date: 2026-08-03

The structured professional profile was verified in Production with a 100%
completion state and records in all four categories.

Public organization profiles and complete job filters were merged in PR #11
and verified in Production on 2026-07-31.

Candidate skills and extended profiles were stabilized in PR #12. Vercel
Preview, candidate flows, authorized hiring-team access, unrelated-employer and
anonymous denial, migrations, RLS, the merge, and the resulting Production
deployment were verified on 2026-08-03.

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

- USHCE branding and English-only marketing content
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
  actions are implemented on `codex/admin-organization-verification` and were
  verified end to end in Vercel Preview on 2026-08-03. The USMCP organization
  changed from `unverified` to `verified`, and the corresponding privileged
  audit event was confirmed in Supabase.

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

Migration files are stored in `supabase/migrations/`.

Never add generated user, organization, job, application, or credential IDs to
schema migrations. Migrations must be reusable in a clean environment.

## Known gaps

The following areas are not complete:

- Resume/CV Builder is not implemented.
- Google and LinkedIn authentication are not implemented.
- Employer verification and manual moderation are implemented and verified in
  Preview; Production publication is pending.
- Platform Admin Panel authorization, metrics, directories, and organization
  verification are implemented; job and user-state moderation remain.
- Stripe payments, subscriptions, invoices, and billing are not implemented.
- Messaging, notifications, and interview scheduling are not implemented.
- AI features are intentionally deferred.
- Full SEO, analytics, and soft-launch operations are not implemented.

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
