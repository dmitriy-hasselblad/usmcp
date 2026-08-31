import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("workspace navigation becomes a readable grid on phone widths", async () => {
  const shells = await Promise.all([
    readProjectFile("src/components/professional/professional-dashboard-shell.tsx"),
    readProjectFile("src/components/employer/employer-dashboard-shell.tsx"),
    readProjectFile("src/components/admin/admin-shell.tsx"),
  ])

  for (const source of shells) {
    assert.match(source, /grid grid-cols-2 gap-1\.5 sm:grid-cols-3 lg:grid-cols-1/)
    assert.match(source, /min-w-0 truncate/)
  }
})

test("document previews can scroll within their own mobile container", async () => {
  const [resume, coverLetter] = await Promise.all([
    readProjectFile("src/components/professional/resume-editor.tsx"),
    readProjectFile("src/components/professional/cover-letter-editor.tsx"),
  ])

  for (const source of [resume, coverLetter]) {
    assert.match(source, /overflow-x-auto pb-3 xl:overflow-visible/)
    assert.match(source, /min-w-\[34rem\] xl:sticky xl:top-4 xl:min-w-0/)
  }
})
