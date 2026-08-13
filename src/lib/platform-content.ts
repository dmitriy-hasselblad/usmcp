const platformDemonstrationOrganizations = new Set([
  "u.s. medical healthcare ecosystem",
  "texas medical group",
])

export function isPlatformDemonstrationOrganization(
  name: string | null | undefined
) {
  return platformDemonstrationOrganizations.has(name?.trim().toLowerCase() ?? "")
}
