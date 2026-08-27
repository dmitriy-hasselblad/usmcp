export const organizationLogosBucket = "organization-logos"
export const organizationLogoMaxBytes = 3 * 1024 * 1024
export const organizationLogoMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export function publicOrganizationLogoUrl(
  path: string | null | undefined,
) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!baseUrl || !path) {
    return null
  }

  return `${baseUrl}/storage/v1/object/public/${organizationLogosBucket}/${path}`
}
