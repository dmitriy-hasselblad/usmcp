import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("platform-admin route guard requires an active platform-admin record", async () => {
  const source = await readProjectFile("src/lib/admin/session.ts")

  assert.match(source, /from\("platform_admins"\)/)
  assert.match(source, /\.eq\("is_active", true\)/)
  assert.match(source, /if \(error \|\| !access\) \{\s*notFound\(\)/s)
})

test("employer workspace is bound to the profile organization membership", async () => {
  const source = await readProjectFile("src/lib/employer/session.ts")

  assert.match(source, /from\("employer_profiles"\)/)
  assert.match(source, /\.select\("organization_id"\)/)
  assert.match(source, /membershipQuery = membershipQuery\.eq\(\s*"organization_id",\s*employerProfile\.organization_id/s)
  assert.match(source, /if \(!membership\) \{\s*redirect\("\/dashboard\/workspace-unavailable"\)/s)
})

test("employer bootstrap keeps the profile organization link synchronized", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260723172251_employer_workspace.sql",
  )

  assert.match(migration, /update public\.employer_profiles\s+set organization_id = new_organization_id/s)
  assert.match(migration, /where employer_profiles\.user_id = current_user_id/s)
})

test("abuse reports remain private, RLS-protected, and auditable", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260807170000_abuse_reporting_oversight.sql",
  )

  assert.match(migration, /alter table public\.abuse_reports enable row level security/)
  assert.match(migration, /create policy "Reporters can read their abuse reports"[\s\S]*reporter_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /create policy "Platform admins can read abuse reports"[\s\S]*private\.is_platform_admin\(\)/)
  assert.match(migration, /if \(select auth\.uid\(\)\) is null or not private\.is_platform_admin\(\) then/)
  assert.match(migration, /private\.record_admin_audit_event\(/)
})

test("CV Builder is limited to the signed-in professional and uses browser PDF export", async () => {
  const [page, builder] = await Promise.all([
    readProjectFile("src/app/dashboard/profile/cv/page.tsx"),
    readProjectFile("src/components/professional/cv-builder.tsx"),
  ])

  assert.match(page, /requireIdentity\("\/dashboard\/profile\/cv"\)/)
  assert.match(page, /account\.data\.account_type !== "professional"/)
  assert.match(page, /from\("professional_experience"\)/)
  assert.match(page, /from\("professional_skills"\)/)
  assert.match(builder, /window\.print\(\)/)
  assert.match(builder, /@page \{ size: letter/)
})
