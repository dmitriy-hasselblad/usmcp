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
  assert.match(jobCard, /job\.source === "live" \? "Live opportunity" : "Product preview"/)
  assert.match(jobDetail, /This sample listing demonstrates the planned application experience\. It is not an active vacancy\./)
  assert.match(jobDetail, /isLive \? `\/jobs\/\$\{job\.slug\}\/apply` : "\/sign-up"/)
})

test("public organization directory remains separate from product-preview employers", async () => {
  const companiesPage = await readProjectFile("src/app/companies/page.tsx")

  assert.match(companiesPage, /getPublicOrganizations\(\)/)
  assert.doesNotMatch(companiesPage, /from "@\/lib\/marketing-data"/)
})
