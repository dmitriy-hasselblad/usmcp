# Public Content Inventory — Early Access

Reviewed: 2026-08-11

## Scope and method

This is a read-only inventory of public USHCE surfaces. It combines a source
review with a Production count check. No Production record, publication state,
or search configuration was changed.

## Production snapshot

| Public surface | Live records | Source |
| --- | ---: | --- |
| Jobs | 7 | `published_jobs` public view |
| Organizations with published jobs | 2 | `published_jobs` public view |
| News & Insights articles | 7 | Approved, published organization posts |

## Public surface review

| Surface | Current content | Early Access status | Decision |
| --- | --- | --- | --- |
| `/jobs` | Live jobs plus six built-in product-preview jobs | Preview cards carry a `Product preview` badge | Keep during the pilot, but maintain their clear label and do not describe them as open roles. |
| `/jobs/[slug]` | Live or product-preview job detail | Preview detail explicitly says it is not an active vacancy | Keep the notice; preview jobs must never display an application action. |
| `/jobs/[slug]/apply` | Live jobs only | Sample jobs cannot enter the application flow | Keep this boundary. |
| Homepage | Live jobs and product-preview cards when applicable | Copy distinguishes published jobs from sample content | Keep the distinction; use real published jobs as the primary promotional content as the marketplace grows. |
| `/companies` and `/companies/[slug]` | Database-backed organizations with published jobs only | No built-in preview organization data is used | Ready for Early Access. |
| `/news` and `/news/[slug]` | Approved, published organization posts only | Blocked, draft, and submitted content is excluded | Ready for Early Access. |
| Sitemap and structured data | Live jobs, live organizations, and approved News only | Product-preview jobs are excluded | Ready for indexing without sample vacancy URLs. |
| `/resources` and `/for-employers` | Product marketing and future-facing guidance | Some copy uses “preview” language | Retain during the pilot; review copy before a wider external launch. |

## Guardrails already in place

- A preview job has a visible `Product preview` label.
- A preview job detail clearly states that it is not an active vacancy.
- Preview jobs are excluded from the real application flow.
- Preview jobs are excluded from the sitemap and live `JobPosting` metadata.
- Public organizations and News are loaded from approved Production data, not
  from the preview dataset.

## Early Access decision

For the planned free 6–12 month pilot, retain the six product-preview job
cards only as clearly labeled demonstrations of the marketplace experience.
They are useful while the employer base grows, but they must remain secondary
to real employer-published opportunities.

Before a wider external launch, choose one of these two actions:

1. Remove all remaining product-preview jobs once enough real live jobs exist;
   or
2. Move product-preview jobs behind an explicit “View product previews” control
   so the default job search contains only live opportunities.

The recommended default is option 2 during Early Access, then option 1 at
broader launch. No implementation change is proposed in this inventory ticket;
the product owner should approve the chosen presentation change first.
