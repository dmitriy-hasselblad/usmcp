export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Per diem",
] as const

export const workplaceTypes = ["On-site", "Hybrid", "Remote"] as const

export const salaryPeriods = ["year", "hour"] as const

export const jobStatuses = ["draft", "published", "paused", "closed"] as const

export type JobStatus = (typeof jobStatuses)[number]
export type OrganizationMemberRole =
  | "owner"
  | "admin"
  | "recruiter"
  | "viewer"

export function isEmploymentType(value: string) {
  return employmentTypes.some((option) => option === value)
}

export function isWorkplaceType(value: string) {
  return workplaceTypes.some((option) => option === value)
}

export function isSalaryPeriod(value: string) {
  return salaryPeriods.some((option) => option === value)
}

export function isJobStatus(value: string): value is JobStatus {
  return jobStatuses.some((option) => option === value)
}

export function canManageOrganization(role: OrganizationMemberRole) {
  return role === "owner" || role === "admin"
}

export function canManageJobs(role: OrganizationMemberRole) {
  return role === "owner" || role === "admin" || role === "recruiter"
}
