# USHCE Blueprint Roadmap

Last updated: 2026-08-13

## Source of truth

This roadmap maps the current codebase to:

`USHCE_Healthcare_Career_Ecosystem_Product_Blueprint_RU.pdf`

Relevant Blueprint references:

- Page 3: recommended implementation order
- Pages 264-271: detailed MVP plan
- Chapter 43: MVP scope, monthly plan, and exclusions

The Blueprint is a product blueprint, not a single sprint and not a strict
table-of-contents implementation order. When chapters repeat or conflict, use
the recommended implementation order on page 3 as the governing sequence.

## Status definitions

- **Completed**: implemented, stored correctly, access-controlled, and verified.
- **In progress**: useful functionality exists, but required scope remains.
- **Not started**: no production implementation exists.
- **Deferred**: intentionally postponed until its dependencies are stable.

## Governing implementation sequence

| Phase | Blueprint focus | Current status |
| --- | --- | --- |
| 1. Foundation | Auth, roles, Supabase schema/RLS, reference data, design system | Completed with minor reference-data gaps |
| 2. Marketplace MVP | Jobs, companies, search, profiles, applications, employer/admin | In progress |
| 3. Trust & Revenue | Verification, payments, subscriptions, audit, notifications | Not started; privacy foundation exists |
| 4. Engagement | Messaging, interviews, content, SEO, analytics | In progress: core messaging, attachments, interviews, calendar export, video, content, SEO, and consent-aware analytics are live |
| 5. Intelligence | CV tools, matching, recommendations, broader marketplace, mobile | Deferred |

## Phase 1: Foundation

### Completed

- [x] USHCE terminology and product identity
- [x] English-only public product language
- [x] Next.js App Router foundation
- [x] Shared UI system and reusable components
- [x] Supabase project integration
- [x] Email/password authentication
- [x] Session persistence
- [x] Professional and employer account types
- [x] Role-aware onboarding
- [x] PostgreSQL schema migrations
- [x] Row Level Security foundation
- [x] Vercel Preview and Production workflow
- [x] Privacy Policy, Cookie Notice, and cookie choices

### Remaining foundation refinements

- [ ] Centralized profession and specialty reference data
- [ ] Centralized geographic reference data beyond the current U.S. state list
- [x] Formal audit-event model for privileged actions (organization
  verification integration verified in Production)
- [ ] Automated test coverage for critical role boundaries

## Phase 2: Marketplace MVP

### Public website

- [x] Homepage
- [x] Job search entry point
- [x] Public job listing
- [x] Public job detail
- [x] Basic job filters
- [x] Public SEO foundation (`robots.txt`, sitemap, canonical metadata, and live JobPosting markup)
- [x] Public supporting pages
- [x] Live public organization directory
- [x] Live public organization profile route
- [x] Complete Blueprint job filters
- [ ] Remove or replace remaining fictional marketplace listings before launch

### Candidate platform

- [x] Candidate registration
- [x] Candidate onboarding
- [x] Professional profile
- [x] Resume/document storage
- [x] Career History
- [x] Job application submission
- [x] Application tracking
- [x] Application withdrawal
- [x] Skills model
- [x] Extended healthcare profile sections
- [x] Recommended jobs (Production verified)
- [x] Standalone résumé builder and PDF export (verified in Production through PR #36)
- [ ] Google sign-in
- [ ] LinkedIn sign-in

### Employer platform

- [x] Employer registration
- [x] Organization creation
- [x] Organization profile management
- [x] Employer dashboard
- [x] Job creation and publishing
- [x] Job management
- [x] Applicant review
- [x] Hiring status management
- [x] Structured candidate career history
- [x] Employer verification (verified in Production)
- [x] Public live organization profile
- [x] Candidate search
- [x] Saved candidates
- [x] Team member invitation and access administration
- [ ] Billing area

### Admin platform

The scoped Priority 4 Basic Admin Panel is complete in Production. Authorization,
the secure route foundation, minimal metrics, the privileged audit-event
boundary, directories, organization and job moderation, and reversible
user-state moderation are verified.

- [x] Admin authentication and authorization
- [x] User management (suspend/reactivate workflow; Production verified)
- [x] Organization moderation (verification workflow; Production verified)
- [x] Employer verification queue (Production verified)
- [x] Job moderation (Production verified)
- [x] Application and abuse reporting oversight (Production verified through
  PR #30)
- [x] Basic platform metrics
- [x] Audit log viewer (Production verified through PR #29)

## Phase 3: Trust & Revenue

Product-owner decision recorded 2026-08-04: launch USHCE as a free Early
Access pilot. Stripe, subscriptions, job-posting payments, invoices, and the
billing portal are deferred until 6-12 months after launch. Current work must
preserve stable organization and user identifiers and keep future billing
separate from profile roles so monetization can be added without migration of
existing accounts.

- [ ] Organization email-domain verification
- [ ] Manual employer verification
- [ ] Verification badges and rules
- [ ] Stripe integration (deferred until 6-12 months after Early Access)
- [ ] Subscription plans (deferred)
- [ ] One-time job-posting payments (deferred)
- [ ] Billing portal (deferred)
- [ ] Invoice history (deferred)
- [ ] Payment webhook handling (deferred)
- [ ] Email notifications (server-only application-status foundation merged in
  PR #23; Resend onboarding, domain verification, delivery testing, and live
  activation deferred)
- [x] In-product notifications (Production verified through PR #49)
- [ ] Formal audit trail

## Phase 4: Engagement

- [x] Candidate-employer messaging (Production verified through PR #49)
- [x] Message attachments (Production verified through PR #49)
- [x] Interview scheduling (Production verified through PR #49)
- [x] Calendar integration via private `.ics` downloads (Production verified through PR #49)
- [x] Private LiveKit video interviews with a five-minute reconnect window (Production verified through PR #49)
- [ ] Career content platform
- [x] Public SEO foundation
- [ ] Ongoing SEO program and search-console operations
- [x] Consent-aware product analytics (Production verified through PR #49)
- [ ] Employer funnel analytics
- [ ] Candidate application analytics

## Phase 5: Intelligence

- [x] Standalone Resume/CV generation and export (non-AI, verified in Production)
- [ ] AI Resume Assistant
- [ ] Basic job recommendations
- [ ] AI Job Description Assistant
- [ ] Candidate-job matching
- [ ] Advanced recommendations
- [ ] Mobile applications

AI is intentionally deferred until the data model, access controls, auditability,
and core hiring loop are stable.

## Chapter 43 monthly-plan comparison

| Blueprint month | Expected scope | Current state |
| --- | --- | --- |
| Month 1 | Architecture, database, design, registration | Substantially completed |
| Month 2 | Candidate profile, CV, search | Profile and candidate search are live; CV deferred |
| Month 3 | Companies, jobs, employer dashboards | Substantially completed; public company pages and complete job filters are live |
| Month 4 | Stripe, subscriptions, payments | Intentionally deferred until 6-12 months after Early Access |
| Month 5 | Admin, management, analytics, security | Scoped Basic Admin Panel, audit viewer, and abuse reporting are in Production; advanced analytics remain |
| Month 6 | Testing, SEO, first users | Not started as a formal launch phase |

## Sequence decisions

### Employer workflow before the complete candidate profile

The employer workspace was implemented before all Candidate MVP fields. This was
an intentional dependency decision that made the first complete hiring loop
possible:

`Employer publishes job -> candidate applies -> employer reviews candidate`

### Career History before CV Builder

Career History is not a separate invention. It implements the structured
Education, Experience, Licenses, and Certifications data required by Candidate
MVP. It is also the data foundation for a future Resume/CV Builder.

### Standalone CV Builder

The Blueprint contains two competing signals: Chapter 43 includes a simple
form-to-PDF Resume Builder in MVP, while the recommended phase table places CV
tools in the later Intelligence phase. Current decision:

- provide a standalone blank document, rather than prefill from the profile;
- retain Career History as a separate profile feature;
- keep stored résumé content and future payment access separate so billing can
  be added later without changing drafts;
- defer AI-assisted writing and advanced generation until the core hiring loop
  has mature data and auditability.

## Roadmap maintenance rule

After every merged product PR:

1. Update the relevant checklist item.
2. Add any newly discovered gap.
3. Record intentional deferrals.
4. Keep `docs/NEXT_STEPS.md` limited to the nearest actionable priorities.
5. Do not mark an item Completed until the end-to-end flow has been verified.

## Explicit deferred dependencies

- **Resend/email delivery:** resume when the product owner is ready to connect
  and verify a sending domain. Production delivery remains disabled meanwhile.
- **Stripe/payments/billing:** resume 6-12 months after Early Access launch.
  These two deferrals must be included in every future remaining-work summary.
