import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("sample jobs remain visibly distinct from live marketplace opportunities", async () => {
  const jobsPage = await readProjectFile("src/app/jobs/page.tsx")
  const jobCard = await readProjectFile("src/components/jobs/job-card.tsx")
  const jobDetail = await readProjectFile("src/app/jobs/[slug]/page.tsx")

  assert.match(jobsPage, /const allJobs = showPreviews \? \[\.\.\.liveJobs, \.\.\.featuredJobs\] : liveJobs/)
  assert.match(jobsPage, /View product previews/)
  assert.match(jobCard, /Platform demonstration/)
  assert.match(jobCard, /Live opportunity/)
  assert.match(jobCard, /Product preview/)
  assert.match(jobDetail, /This sample listing demonstrates the planned application experience\. It is not an active vacancy\./)
  assert.match(jobDetail, /href=\{isLive \? `\/jobs\/\$\{job\.slug\}\/apply` : "\/jobs"\}/)
})

test("public organization directory remains separate from product-preview employers", async () => {
  const companiesPage = await readProjectFile("src/app/companies/page.tsx")

  assert.match(companiesPage, /getPublicOrganizations\(\)/)
  assert.doesNotMatch(companiesPage, /from "@\/lib\/marketing-data"/)
})

test("platform demonstrations and editorial content cannot be mistaken for employer publishing", async () => {
  const jobsPage = await readProjectFile("src/app/jobs/page.tsx")
  const jobDetail = await readProjectFile("src/app/jobs/[slug]/page.tsx")
  const organizationCard = await readProjectFile("src/components/organizations/organization-card.tsx")
  const organizationDetail = await readProjectFile("src/app/companies/[slug]/page.tsx")
  const trustBadge = await readProjectFile("src/components/organizations/organization-trust-badge.tsx")
  const newsDetail = await readProjectFile("src/app/news/[slug]/page.tsx")

  assert.match(jobsPage, /Product previews are demonstrations and are not active vacancies\./)
  assert.match(jobDetail, /Applications are disabled/)
  assert.match(jobDetail, /JobPosting search metadata/)
  assert.match(organizationCard, /View platform demonstrations/)
  assert.match(organizationCard, /OrganizationTrustBadge/)
  assert.match(trustBadge, /if \(isPlatformDemo\)/)
  assert.match(trustBadge, /Platform demonstration/)
  assert.match(organizationDetail, /does not represent an independently verified healthcare\s+employer/)
  assert.match(newsDetail, /Platform demonstration/)
  assert.match(newsDetail, /not an announcement from a clinic, hospital, government agency, or other healthcare employer/i)
})

test("copied platform records stay out of the public marketplace while fictional previews remain available", async () => {
  const marketplace = await readProjectFile("src/lib/jobs/public-jobs.ts")
  const previews = await readProjectFile("src/lib/marketing-data.ts")

  assert.match(marketplace, /\.filter\(\(job\) => !job\.isPlatformDemo\)/)
  assert.match(marketplace, /return job\.isPlatformDemo \? undefined : job/)
  assert.match(previews, /Aster Demo Health Network/)
  assert.match(previews, /Cedar Demo Care Collective/)
  assert.match(previews, /Juniper Demo Academic Center/)
  assert.match(previews, /Lumen Demo Medical Group/)
  assert.doesNotMatch(previews, /Harborview Health Network|Northwell Care|Sage University Hospital|Pioneer Medical Group/)
})
