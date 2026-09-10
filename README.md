# USHCE - The U.S. Healthcare Career Ecosystem

The production foundation for a U.S.-focused healthcare career platform. The
current MVP includes a responsive public website, live and product-preview job
search, official federal opportunities from USAJOBS, public job-detail pages,
organization and employer sections, career resources, role-aware Supabase
authentication, and a data-backed employer workspace with secure candidate
applications, professional profile editing, and private resume and credential
storage.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and owned shadcn/ui components
- Supabase SSR clients for browser, server, and session refresh
- pnpm lockfile for repeatable Vercel builds

## Public routes

- `/` - product homepage and career pathways
- `/jobs` - searchable live and preview job listings
- `/jobs/[slug]` - public live or preview job details
- `/jobs/[slug]/apply` - protected application form for live jobs
- `/companies` - preview healthcare organization profiles
- `/for-employers` - employer product introduction
- `/resources` - career resource library preview
- `/resources/licensure` - all 50 state licensure guides and official sources
- `/salary` - Salary Hub with U.S. wage benchmarks by profession and state
- `/for-associations` - Early Access information for healthcare associations
- `/sign-in` and `/sign-up` - Supabase email and password access
- `/forgot-password` and `/update-password` - account recovery
- `/onboarding` - protected role-aware profile setup
- `/dashboard` - protected role-aware account workspace
- `/dashboard/profile` - professional profile and private document management
- `/dashboard/profile/career` - structured education, experience, licenses, and certifications
- `/dashboard/documents/[id]/download` - authorized short-lived document access
- `/dashboard/jobs` - employer job management
- `/dashboard/jobs/new` - private employer job-draft creation
- `/dashboard/organization` - employer organization settings
- `/dashboard/applications` - role-aware candidate and employer application list
- `/dashboard/applications/[id]` - protected application review and status page

All public interface content is written in English for a U.S. audience. Sample
jobs and organizations are clearly labeled as product-preview content and are
not presented as live or verified records.

## Current public opportunity data

The public marketplace combines published SM VIA roles with current official
federal opportunities from USAJOBS. Federal roles remain external
opportunities: each role identifies USAJOBS as its source and sends the
candidate to the official USAJOBS application page. They do not enter the SM
VIA application workflow.

The homepage uses this combined active-role set for its featured opportunities,
profession links, search results, and interactive U.S. opportunity map. The map
uses a real state outline, shows a current count for each state with active
roles, and each state opens the matching `/jobs?state=XX` search. Counts go up
or down when an SM VIA role is published, paused, closed, or expires, and when
the next USAJOBS refresh returns a changed federal listing set.

USAJOBS data is fetched server-side and refreshed hourly. Configure these only
as server-side Vercel secrets in Preview and Production:

- `USAJOBS_API_KEY`
- `USAJOBS_API_EMAIL`

If either value is absent or the official source is temporarily unavailable,
SM VIA continues to show its own published roles without exposing an error or
blocking the marketplace.

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL and publishable key from the project Connect dialog.
4. Start the app with `pnpm dev`.

The public website works without Supabase credentials. Authentication remains
disabled until the database schema has been applied and
`NEXT_PUBLIC_AUTH_ENABLED=true` is configured. The included proxy refreshes
sessions, while protected routes and actions validate identity again on the
server.

## Project layout

```text
src/
  app/                    App Router pages, metadata, and loading states
  components/
    auth/                 Account access and status components
    applications/         Application status components
    brand/                USHCE identity
    employer/             Employer workspace shell and job components
    jobs/                 Reusable job components
    layout/               Shared header and footer
    marketing/            Homepage and search components
    professional/         Professional workspace shell
    ui/                   Owned shadcn/ui primitives
  lib/
    auth/                 Validation and protected-session helpers
    applications/         Application types and status rules
    employer/             Employer roles, validation, and workspace access
    jobs/                 Public marketplace data access
    professional/         Professional profile and document rules
    marketing-data.ts     Typed preview content
    supabase/             Browser, server, and session clients
  proxy.ts                Next.js session refresh proxy
supabase/
  migrations/             Versioned database changes
  schema.sql              Consolidated foundation; apply newer migrations after it
  README.md               Supabase dashboard and email configuration
```

## Deployment

Push the project to its connected GitHub repository. Vercel detects Next.js and
builds it automatically. Follow `supabase/README.md`, apply the schema, configure
the public environment variables, and enable authentication only after the
database checks pass.

### Isolated Preview / staging environment

Preview deployments use a separate Supabase project (`smvia-staging`). This lets
the team record demo employer accounts, candidate profiles, test jobs,
applications, messages, organization logos, and uploaded documents without
creating or changing any production records. The production Supabase project and
the public `smvia.org` deployment remain separate.

Configure the following values in Vercel with the **Preview** environment scope:

- `NEXT_PUBLIC_SUPABASE_URL` — the staging Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the staging project's publishable key
- `NEXT_PUBLIC_IS_STAGING=true`

Keep the production Supabase URL and publishable key scoped only to
**Production**. The staging Supabase Authentication URL configuration must allow
`https://*-dmitriy-hasselblads-projects.vercel.app/**` so email confirmation and
password-recovery links return to the deployment where the user started.

`NEXT_PUBLIC_VERCEL_URL` is supplied by Vercel to Preview deployments. The app
uses it when `NEXT_PUBLIC_IS_STAGING=true`, which keeps confirmation and recovery
flows inside the same preview instead of sending test users to the public site.

The staging database is intentionally empty when created. Apply the consolidated
schema and the safe, applicable migrations from `supabase/migrations/` before
testing. Do not copy production users, applications, documents, or organization
data into staging. The administrative transfer migration is intentionally
excluded from a shared demo environment because it assigns privileged access to
a specific account.

Official USAJOBS opportunities can still appear in Preview because they are
fetched from the public federal source at request time; they are external links,
not records stored in either Supabase database.

For preview video interviews, configure a dedicated Preview LiveKit test project
and add its server credentials only to the Preview environment. Do not reuse or
expose production media credentials in a shared demo environment.

## Current application milestone

Employer accounts can manage their organization, create job drafts, and move
jobs between draft, published, paused, and closed workspace states. Published
jobs appear in the public marketplace and receive a stable public URL. Draft,
paused, and closed jobs remain private. Professional accounts can apply to live
jobs, track status, and withdraw active applications. Authorized hiring teams
can review applicant details and move applications through submitted, review,
interview, offer, and not-selected stages.
Professional accounts can edit career details and upload resumes, licenses,
and certifications to a private Supabase Storage bucket. A hiring team can
open only the resume attached to an application for its own organization.
Professionals can also maintain structured education, training, experience,
license, and certification records. These records remain private until the
professional applies to an organization's job, and are removed from that
organization's access if the application is withdrawn.

## Recommended next milestone

Add employer verification and interview scheduling, followed by notifications
and candidate search.
