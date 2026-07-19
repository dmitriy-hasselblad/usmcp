# USHCE — The U.S. Healthcare Career Ecosystem

The initial production-ready foundation for a healthcare-focused career platform. It includes a responsive marketing homepage, reusable shadcn/ui components, a Supabase SSR-ready integration layer, and Vercel-ready Next.js configuration.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 + shadcn/ui source components
- Supabase SSR clients for browser, server, and session proxy
- pnpm lockfile for repeatable builds

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL and publishable key from the project’s Connect dialog.
4. Start the app with `pnpm dev`.

The marketing page works without Supabase credentials. When credentials are supplied, the included proxy will refresh authentication sessions. Future protected routes must still validate identity and authorization server-side with `supabase.auth.getClaims()`.

## Project layout

```
src/
├── app/                    # App Router routes, loading/error states, global styles
├── components/
│   ├── brand/              # USHCE logo and visual identity
│   ├── layout/             # Header and footer
│   ├── marketing/          # Homepage-specific building blocks
│   └── ui/                 # Owned shadcn/ui components
├── lib/
│   ├── marketing-data.ts   # Starter content, easily replaced by Supabase data
│   └── supabase/           # Browser, server, and session proxy clients
└── proxy.ts                # Next.js 16 session refresh proxy
```

## Deployment

Push this folder to a GitHub repository and import it in Vercel. Vercel detects Next.js automatically. Add the two `NEXT_PUBLIC_SUPABASE_*` variables in Vercel before enabling authentication or data-backed pages.

## Recommended next milestones

1. Connect Supabase authentication for professional and employer registration.
2. Create schema migrations for profiles, companies, jobs, and applications with row-level security.
3. Replace starter marketing data with published, approved records.
4. Build professional, employer, and administrator dashboard route groups.
