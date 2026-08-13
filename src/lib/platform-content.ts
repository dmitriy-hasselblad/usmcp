export function isUshcePlatformOrganization(name: string | null | undefined) {
  return name?.trim().toLowerCase() === "u.s. medical healthcare ecosystem"
}
