import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("sitemap indexes public marketing, career resources, jobs, organizations, and news pages", async () => {
  const source = await readProjectFile("src/app/sitemap.ts")

  assert.match(source, /getPublishedJobs\(\)/)
  assert.match(source, /getPublicOrganizations\(\)/)
  assert.match(source, /getPublishedOrganizationPostSitemapEntries\(\)/)
  assert.match(source, /resourceGuides/)
  assert.match(source, /`\/resources\/\$\{guide\.slug\}`/)
  assert.match(source, /getAbsoluteUrl\("\/resources\/licensure"\)/)
  assert.match(source, /getAbsoluteUrl\("\/jobs"\)/)
  assert.doesNotMatch(source, /\/dashboard/)
})

test("robots policy excludes private application areas and publishes the sitemap", async () => {
  const source = await readProjectFile("src/app/robots.ts")

  assert.match(source, /"\/admin\/"/)
  assert.match(source, /"\/dashboard\/"/)
  assert.match(source, /"\/api\/"/)
  assert.match(source, /getAbsoluteUrl\("\/sitemap\.xml"\)/)
})

test("private workspaces and application forms are explicitly excluded from indexing", async () => {
  const [dashboardLayout, adminLayout, applicationPage] = await Promise.all([
    readProjectFile("src/app/dashboard/layout.tsx"),
    readProjectFile("src/app/admin/layout.tsx"),
    readProjectFile("src/app/jobs/[slug]/apply/page.tsx"),
  ])

  for (const source of [dashboardLayout, adminLayout, applicationPage]) {
    assert.match(source, /robots:\s*\{ index: false, follow: false \}/)
  }
})

test("search metadata excludes previews while keeping JobPosting current", async () => {
  const source = await readProjectFile("src/app/jobs/[slug]/page.tsx")

  assert.match(source, /robots: \{ index: false, follow: false \}/)
  assert.match(source, /validThrough: job\.expiresAt/)
  assert.match(source, /directApply: true/)
  assert.match(source, /Breadcrumbs/)
})

test("organization discovery excludes platform demonstration profiles and adds organization schema", async () => {
  const [organizations, companyPage] = await Promise.all([
    readProjectFile("src/lib/organizations/public-organizations.ts"),
    readProjectFile("src/app/companies/[slug]/page.tsx"),
  ])

  assert.match(organizations, /filter\(\(organization\) => !organization\.isPlatformProfile\)/)
  assert.match(companyPage, /"@type": "Organization"/)
  assert.match(companyPage, /Breadcrumbs/)
})

test("live job details emit JobPosting structured data with a publication date", async () => {
  const source = await readProjectFile("src/app/jobs/[slug]/page.tsx")

  assert.match(source, /isLive && job\.publishedAt \? getJobPosting\(job\) : null/)
  assert.match(source, /"@type": "JobPosting"/)
  assert.match(source, /datePosted: job\.publishedAt/)
  assert.match(source, /application\/ld\+json/)
})

test("root metadata establishes a canonical site base and social defaults", async () => {
  const source = await readProjectFile("src/app/layout.tsx")

  assert.match(source, /metadataBase: getSiteUrl\(\)/)
  assert.match(source, /openGraph:/)
  assert.match(source, /twitter:/)
})

test("optional analytics remains behind an explicit visitor consent choice", async () => {
  const [analyticsSource, consentSource] = await Promise.all([
    readProjectFile("src/components/privacy/consent-aware-analytics.tsx"),
    readProjectFile("src/lib/privacy/cookie-consent.ts"),
  ])

  assert.match(analyticsSource, /useCookieConsent\(\)/)
  assert.match(analyticsSource, /if \(!preferences\?\.analytics\)/)
  assert.match(analyticsSource, /return <Analytics \/>/)
  assert.match(consentSource, /COOKIE_CONSENT_VERSION = 2/)
})
