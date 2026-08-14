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
  const newsDetail = await readProjectFile("src/app/news/[slug]/page.tsx")

  assert.match(jobsPage, /platform demonstrations/i)
  assert.match(jobDetail, /Applications are disabled/)
  assert.match(jobDetail, /JobPosting search metadata/)
  assert.match(organizationCard, /View platform demonstrations/)
  assert.match(organizationCard, /!organization\.isPlatformProfile/)
  assert.match(organizationCard, /Platform demonstration/)
  assert.match(organizationDetail, /does not represent an independently verified healthcare\s+employer/)
  assert.match(newsDetail, /Platform demonstration/)
  assert.match(newsDetail, /not an announcement from a clinic, hospital, government agency, or other healthcare employer/i)
})
