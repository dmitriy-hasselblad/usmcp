# SM VIA SEO rollout

Source: **SMVIA SEO Blueprint v1.0** (August 29, 2026).

## Phase 1 — technical foundation

Implemented in `codex/seo-technical-core`:

- The canonical public sitemap includes live jobs, live organizations, approved news, resources, and public marketing pages only.
- Platform demonstrations are excluded from the public organization catalog and sitemap.
- `robots.txt` points to the sitemap and keeps protected application, account, administrative, invitation, and API routes out of crawling.
- Dashboard, administrative, authentication, onboarding, password-recovery, and job-application pages carry explicit `noindex, nofollow` metadata.
- Public jobs use canonical metadata, Open Graph data, live-only `JobPosting` JSON-LD, `validThrough`, and `directApply`.
- Public organization pages use canonical metadata, `Organization` JSON-LD, and visible/schema breadcrumbs.
- Job pages use visible/schema breadcrumbs.

## Guardrails

- Do not create location, profession, salary, or licensing landing pages until each has either at least three live matching jobs or reviewed editorial content.
- Filter query URLs are for user experience; they are not sitemap entries and should not become indexable landing pages.
- Do not index platform demos, closed/expired roles, private dashboards, application forms, or preview content.

## Next SEO phases

1. Verify Google Search Console and Bing Webmaster Tools keep receiving the canonical sitemap.
2. Add dedicated profession/state pages only where the eligibility rule above is met.
3. Add licensure, salary, international-professional, and editorial hubs with reviewed source material.
4. Track indexed pages, impressions, clicks, applications from organic search, and employer sign-ups from organic search.
