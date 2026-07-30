# USHCE Project Status

Last updated: 2026-07-30

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
- Latest confirmed product merge: PR #9
- Merge commit: `edf4a4a7021fe6c54a34aa293eb17a375c075a6a`
- Production deployment status at verification: `Ready`
- Production build duration: 48 seconds
- Production verification date: 2026-07-29

The structured professional profile was verified in Production with a 100%
completion state and records in all four categories.

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
- Specialty, employment type, location, and visa-support filtering
- Healthcare organizations preview page
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

Migration files are stored in `supabase/migrations/`.

Never add generated user, organization, job, application, or credential IDs to
schema migrations. Migrations must be reusable in a clean environment.

## Known gaps

The following areas are not complete:

- Public organization profiles are still preview data rather than live,
  organization-specific Supabase pages.
- Job search does not yet have all Blueprint filters, including experience and
  salary ranges.
- The professional profile does not yet include a complete skills model and
  other extended healthcare profile sections.
- Resume/CV Builder is not implemented.
- Google and LinkedIn authentication are not implemented.
- Employer verification and manual moderation are not implemented.
- Platform Admin Panel is not implemented.
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
