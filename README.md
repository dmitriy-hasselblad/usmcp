# USHCE - The U.S. Healthcare Career Ecosystem

The production foundation for a U.S.-focused healthcare career platform. The
current MVP includes a responsive public website, working product-preview job
search, job-detail pages, organization and employer sections, career resources,
and Supabase-ready account architecture.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and owned shadcn/ui components
- Supabase SSR clients for browser, server, and session refresh
- pnpm lockfile for repeatable Vercel builds

## Public routes

- `/` - product homepage and career pathways
- `/jobs` - searchable and filterable preview job listings
- `/jobs/[slug]` - preview job details
- `/companies` - preview healthcare organization profiles
- `/for-employers` - employer product introduction
- `/resources` - career resource library preview
- `/sign-in` and `/sign-up` - non-collecting account previews

All public interface content is written in English for a U.S. audience. Sample
jobs and organizations are clearly labeled as product-preview content and are
not presented as live or verified records.

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL and publishable key from the project Connect dialog.
4. Start the app with `pnpm dev`.

The public website works without Supabase credentials. When credentials are
supplied, the included proxy can refresh authentication sessions. Protected
routes must still validate identity and authorization server-side.

## Project layout

```text
src/
  app/                    App Router pages, metadata, and loading states
  components/
    auth/                 Account-access preview components
    brand/                USHCE identity
    jobs/                 Reusable job components
    layout/               Shared header and footer
    marketing/            Homepage and search components
    ui/                   Owned shadcn/ui primitives
  lib/
    marketing-data.ts     Typed preview content
    supabase/             Browser, server, and session clients
  proxy.ts                Next.js session refresh proxy
```

## Deployment

Push the project to its connected GitHub repository. Vercel detects Next.js and
builds it automatically. Add the `NEXT_PUBLIC_SUPABASE_*` variables in Vercel
before enabling authentication or database-backed pages.

## Recommended next milestone

Connect Supabase authentication and create role-aware onboarding for healthcare
professionals and employers. Then introduce schema migrations for profiles,
organizations, jobs, and applications with row-level security.
