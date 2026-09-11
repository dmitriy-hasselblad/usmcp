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
- `/news` - public editorial hub for SM VIA career guides and organization updates
- `/news/[slug]` - individual public news or career-guide article
- `/for-employers` - employer product introduction
- `/resources` - career resource library preview
- `/resources/licensure` - all 50 state licensure guides and official sources
- `/salary` - Salary Hub with U.S. wage benchmarks by profession and state
- `/salary/[profession]/[state]` - state-specific wage benchmarks, licensure planning, live opportunities, employer links, and related professions
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

## News and editorial hub (preview work in progress)

The News & Insights route is being rebuilt as a distinct editorial destination,
not a generic archive. The intended public structure is:

- a wide, photo-led editorial hero with a career-intelligence message;
- an **SM VIA Career Guides** section for independently researched, practical
  guidance written by SM VIA;
- a separate **Organization updates** section reserved for verified healthcare
  organizations publishing their own material.

The current preview branch is `codex/news-editorial-hub`. It contains ten
staging-only SM VIA career-guide articles and distinct cover imagery. The articles
remain in the staging Supabase project; no staging article has been copied to the
production database, and no existing production organization news has been
removed or changed.

The visual layout remains an active design task. The target is the supplied
editorial reference: a full-width pale-blue hero with a healthcare photograph
anchored on the right, elegant serif headlines, low/wide image cards, and compact
horizontal organization-update cards. Do not promote this branch to production
until the page has been reviewed against that reference at desktop and mobile
sizes.

## Current public opportunity data

The public marketplace combines published SM VIA roles with current official
federal opportunities from USAJOBS and a small curated group of official
Greenhouse, Lever, and Ashby employer boards. Every external role retains a clear
source label and sends the candidate to the original employer or USAJOBS page
for complete details and application. External roles never enter the SM VIA
application workflow.

The homepage uses this combined active-role set for its featured opportunities,
profession links, search results, and interactive U.S. opportunity map. The map
uses a real state outline, shows a current count for each state with active
roles, and each state opens the matching `/jobs?state=XX` search. Counts go up
or down when an SM VIA role is published, paused, closed, or expires, and when
the next source refresh returns a changed listing set. National or remote-only
roles remain searchable but do not inflate a particular state's map count.

USAJOBS data is fetched server-side and refreshed hourly. Configure these only
as server-side Vercel secrets in Preview and Production:

- `USAJOBS_API_KEY`
- `USAJOBS_API_EMAIL`

If either USAJOBS value is absent, or an official source is temporarily
unavailable, SM VIA continues to show its own published roles and the remaining
sources without exposing an error or blocking the marketplace. Greenhouse, Lever,
and Ashby public boards do not require SM VIA credentials.

## Salary pages and discovery

State salary pages use the relevant U.S. Bureau of Labor Statistics wage
benchmark and place it in local career context: comparison with the national
median, a direct link to the applicable state licensure guide, current SM VIA
and USAJOBS opportunities in that state, employer pages when matching live
roles exist, and related professions with their own state benchmarks. A role is
never invented to fill a section; empty sections make the next relevant search
or organization directory available instead.

The sitemap includes the Salary Hub, the 50-state licensure resource library,
individual licensure guides, association information, and salary URLs only
where a state wage estimate exists. This avoids asking search engines to index
thin salary pages without underlying data.

## Planned external opportunity sources

USAJOBS, Greenhouse, Lever, and Ashby are active external sources. The ATS pilot
uses identified healthcare employers only: Habitat Health, Heartbeat Health, Lyra
Health, Onos Health, Interra Health, and Citizen Health. Each source is a distinct
external-opportunity adapter, retains clear attribution, links candidates to
the original employer application page, and removes a listing automatically
when it no longer appears in the next refresh. Public ATS APIs are connected
only for identified employers and only after their applicable terms and
technical behavior have been reviewed; no broad scraping is planned.

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

Expand the curated Greenhouse/Lever/Ashby healthcare-employer pilot only after
checking each prospective board's current public behavior and attribution
requirements. CareerOneStop remains a possible later source once its access is
available from the operating region. Employer verification, interview
scheduling, notifications, and candidate search remain separate product
milestones.
