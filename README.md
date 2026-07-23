# USHCE - The U.S. Healthcare Career Ecosystem

The production foundation for a U.S.-focused healthcare career platform. The
current MVP includes a responsive public website, live and product-preview job
search, public job-detail pages, organization and employer sections, career
resources, role-aware Supabase authentication, and a data-backed employer
workspace.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and owned shadcn/ui components
- Supabase SSR clients for browser, server, and session refresh
- pnpm lockfile for repeatable Vercel builds

## Public routes

- `/` - product homepage and career pathways
- `/jobs` - searchable live and preview job listings
- `/jobs/[slug]` - public live or preview job details
- `/companies` - preview healthcare organization profiles
- `/for-employers` - employer product introduction
- `/resources` - career resource library preview
- `/sign-in` and `/sign-up` - Supabase email and password access
- `/forgot-password` and `/update-password` - account recovery
- `/onboarding` - protected role-aware profile setup
- `/dashboard` - protected role-aware account workspace
- `/dashboard/jobs` - employer job management
- `/dashboard/jobs/new` - private employer job-draft creation
- `/dashboard/organization` - employer organization settings

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

## Project layout

```text
src/
  app/                    App Router pages, metadata, and loading states
  components/
    auth/                 Account access and status components
    brand/                USHCE identity
    employer/             Employer workspace shell and job components
    jobs/                 Reusable job components
    layout/               Shared header and footer
    marketing/            Homepage and search components
    ui/                   Owned shadcn/ui primitives
  lib/
    auth/                 Validation and protected-session helpers
    employer/             Employer roles, validation, and workspace access
    marketing-data.ts     Typed preview content
    supabase/             Browser, server, and session clients
  proxy.ts                Next.js session refresh proxy
supabase/
  migrations/             Versioned database changes
  schema.sql              Complete authentication and employer schema
  README.md               Supabase dashboard and email configuration
```

## Deployment

Push the project to its connected GitHub repository. Vercel detects Next.js and
builds it automatically. Follow `supabase/README.md`, apply the schema, configure
the public environment variables, and enable authentication only after the
database checks pass.

## Current employer milestone

Employer accounts can manage their organization, create job drafts, and move
jobs between draft, published, paused, and closed workspace states. Published
jobs appear in the public marketplace and receive a stable public URL. Draft,
paused, and closed jobs remain private.

## Recommended next milestone

Add the candidate application workflow and employer-facing candidate pipeline.
