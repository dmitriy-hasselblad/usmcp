# USHCE - The U.S. Healthcare Career Ecosystem

The production foundation for a U.S.-focused healthcare career platform. The
current MVP includes a responsive public website, live and product-preview job
search, public job-detail pages, organization and employer sections, career
resources, role-aware Supabase authentication, and a data-backed employer
workspace with secure candidate applications, professional profile editing,
and private resume and credential storage.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and owned shadcn/ui components
- Supabase SSR clients for browser, server, and session refresh
- pnpm lockfile for repeatable Vercel builds

## Public routes

- `/` - product homepage and career pathways
- `/jobs` - searchable SM VIA employer listings, product previews, and current
  federal healthcare opportunities supplied by USAJOBS
- `/jobs/[slug]` - public live or preview job details
- `/jobs/[slug]/apply` - protected application form for live jobs
- `/companies` - preview healthcare organization profiles
- `/for-employers` - employer product introduction
- `/resources` - career resource library preview
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

### Optional USAJOBS source

SM VIA can include current federal healthcare opportunities from the official
USAJOBS API. This source is read at request time and is cached for about one
hour; it is not imported into Supabase and does not create applications,
employer accounts, or candidate records in SM VIA.

Configure these server-only Vercel/local environment variables when enabling
the integration:

```text
USAJOBS_API_KEY=<official USAJOBS API key>
USAJOBS_API_EMAIL=<email registered with USAJOBS API>
```

Never expose the API key in browser code, source control, screenshots, or
documentation. USAJOBS cards are visibly attributed, retain the official data
context, and link candidates to USAJOBS for the job detail and application.
They do not use SM VIA's internal application, document, notification, or
employer-workflow paths.

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

Federal USAJOBS opportunities are a separate, read-only catalog source. They
are combined with active SM VIA employer jobs only for public discovery: the
jobs listing, homepage cards, profession pathways, and U.S. opportunity map.
The state map, profession filters, state filters, and their URL links use the
same source data and therefore reflect additions or removals on the next
hourly refresh. This does not change the publication duration, renewal,
expiration, moderation, visibility, or application workflow for jobs published
by registered SM VIA organizations.

## Recommended next milestone

Add employer verification and interview scheduling, followed by notifications
and candidate search.
