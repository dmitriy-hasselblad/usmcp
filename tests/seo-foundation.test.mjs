import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("sitemap indexes public marketing, jobs, organizations, and news pages", async () => {
  const source = await readProjectFile("src/app/sitemap.ts")

  assert.match(source, /getPublishedJobs\(\)/)
  assert.match(source, /getPublicOrganizations\(\)/)
  assert.match(source, /getPublishedOrganizationPostSitemapEntries\(\)/)
  assert.match(source, /getAbsoluteUrl\("\/jobs"\)/)
  assert.doesNotMatch(source, /\/dashboard/)
})

test("robots policy excludes private application areas and publishes the sitemap", async () => {
  const source = await readProjectFile("src/app/robots.ts")

  assert.match(source, /"\/admin\/"/)
  assert.match(source, /"\/dashboard\/"/)
  assert.match(source, /getAbsoluteUrl\("\/sitemap\.xml"\)/)
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
