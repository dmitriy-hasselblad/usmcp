export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Per diem",
] as const

export const workplaceTypes = ["On-site", "Hybrid", "Remote"] as const

export const experienceLevels = [
  "Entry level",
  "Mid level",
  "Senior level",
  "Executive",
  "Not specified",
] as const

export const salaryPeriods = ["year", "hour"] as const

export const employmentArrangements = [
  "Not specified",
  "W-2 direct hire",
  "1099 independent contractor",
  "Agency placement",
  "Other",
] as const

export const licensureRequirements = [
  "Not specified",
  "Active state license required",
  "Eligible to obtain a state license",
  "Compact license preferred",
] as const

export const careSettings = [
  "Acute care",
  "Ambulatory / outpatient",
  "Rehabilitation",
  "Home health",
  "Long-term care",
  "Behavioral health",
  "Academic / research",
  "Telehealth",
] as const

export const relocationSupportOptions = [
  "Not offered",
  "May be available",
  "Available",
] as const

export const visaSponsorshipOptions = [
  "Not offered",
  "May be considered",
  "Available",
] as const

export const visaPathways = [
  "H-1B",
  "Employment-based permanent residence",
  "Other",
] as const

export const jobPostingDurations = [30, 60, 90] as const

export const jobStatuses = ["draft", "published", "paused", "closed"] as const

export type JobStatus = (typeof jobStatuses)[number]
export type OrganizationMemberRole =
  | "owner"
  | "admin"
  | "recruiter"
  | "viewer"

export const assignableOrganizationRoles = ["admin", "recruiter", "viewer"] as const

export function isAssignableOrganizationRole(
  value: string,
): value is (typeof assignableOrganizationRoles)[number] {
  return assignableOrganizationRoles.some((role) => role === value)
}

export function isEmploymentType(value: string) {
  return employmentTypes.some((option) => option === value)
}

export function isWorkplaceType(value: string) {
  return workplaceTypes.some((option) => option === value)
}

export function isExperienceLevel(value: string) {
  return experienceLevels.some((option) => option === value)
}

export function isSalaryPeriod(value: string) {
  return salaryPeriods.some((option) => option === value)
}

export function isEmploymentArrangement(value: string) {
  return employmentArrangements.some((option) => option === value)
}

export function isLicensureRequirement(value: string) {
  return licensureRequirements.some((option) => option === value)
}

export function isRelocationSupport(value: string) {
  return relocationSupportOptions.some((option) => option === value)
}

export function isVisaSponsorship(value: string) {
  return visaSponsorshipOptions.some((option) => option === value)
}

export function isCareSetting(value: string) {
  return careSettings.some((option) => option === value)
}

export function isVisaPathway(value: string) {
  return visaPathways.some((option) => option === value)
}

export function isJobPostingDuration(
  value: number,
): value is (typeof jobPostingDurations)[number] {
  return jobPostingDurations.some((option) => option === value)
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
