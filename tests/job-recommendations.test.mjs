import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

test("job recommendations require a profession or specialty match", async () => {
  const source = await readFile(path.join(projectRoot, "src/lib/jobs/recommendations.ts"), "utf8")
  assert.match(source, /professionMatch \|\| specialtyMatch/)
  assert.match(source, /filter\(\(job\) => job\.hasCareerMatch\)/)
  assert.doesNotMatch(source, /filter\(\(job\) => job\.score > 0\)/)
})

test("filled profiles receive an honest no-match state", async () => {
  const source = await readFile(path.join(projectRoot, "src/app/dashboard/page.tsx"), "utf8")
  assert.match(source, /No close matches are available right now/)
})

test("recommendations can explain matching required skills", async () => {
  const source = await readFile(path.join(projectRoot, "src/lib/jobs/recommendations.ts"), "utf8")
  assert.match(source, /requiredSkills/)
  assert.match(source, /matching skill/)
})
