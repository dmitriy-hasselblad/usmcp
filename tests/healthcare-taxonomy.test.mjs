import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const taxonomy = readFileSync("src/lib/healthcare-taxonomy.ts", "utf8")
const fields = readFileSync("src/components/forms/profession-specialty-fields.tsx", "utf8")
const onboardingAction = readFileSync("src/app/auth/actions.ts", "utf8")
const profileAction = readFileSync("src/app/dashboard/profile/actions.ts", "utf8")
const jobAction = readFileSync("src/app/dashboard/actions.ts", "utf8")

assert.match(taxonomy, /Physicians and surgeons/)
assert.match(taxonomy, /Dentistry and oral health/)
assert.match(taxonomy, /Behavioral and mental health/)
assert.match(taxonomy, /Public health, research, and education/)
assert.match(fields, /Healthcare category/)
assert.match(fields, /Other specialty/)
assert.match(fields, /name="specialty"/)
assert.match(onboardingAction, /isHealthcareProfession\(profession\)/)
assert.match(profileAction, /isHealthcareProfession\(profession\)/)
assert.match(jobAction, /isHealthcareProfession\(profession\)/)

console.log("Healthcare taxonomy checks passed.")
