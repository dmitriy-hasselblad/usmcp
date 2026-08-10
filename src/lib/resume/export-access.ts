export type ResumeExportAccess = {
  allowed: boolean
  mode: "early_access_free" | "payment_required"
}

// This is the single entitlement boundary for résumé export. When billing is
// introduced, replace this decision without changing stored résumé content.
export function getResumeExportAccess(): ResumeExportAccess {
  return { allowed: true, mode: "early_access_free" }
}
