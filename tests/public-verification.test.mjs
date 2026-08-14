import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("public verification badges distinguish verified employers from demos", async () => {
  const badge = await readProjectFile("src/components/organizations/organization-trust-badge.tsx")
  const jobMapper = await readProjectFile("src/lib/jobs/public-jobs.ts")
  const jobCard = await readProjectFile("src/components/jobs/job-card.tsx")

  assert.match(badge, /if \(isPlatformDemo\)/)
  assert.match(badge, /Platform demonstration/)
  assert.match(badge, /verificationStatus === "verified"/)
  assert.match(badge, /Learn what verified organization means/)
  assert.match(jobMapper, /organizationVerificationStatus: row\.verification_status/)
  assert.match(jobCard, /showNeutral=\{false\}/)
})

test("verification explanation states review scope and limits", async () => {
  const page = await readProjectFile("src/app/verification/page.tsx")

  assert.match(page, /What verification means on USHCE/)
  assert.match(page, /What USHCE reviews/)
  assert.match(page, /What it does not guarantee/)
  assert.match(page, /absence of a badge is not a negative rating/)
})
