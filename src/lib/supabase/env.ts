const requiredPublicVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const

export function isSupabaseConfigured() {
  return requiredPublicVariables.every((name) => Boolean(process.env[name]))
}

export function isAuthEnabled() {
  return (
    process.env.NEXT_PUBLIC_AUTH_ENABLED === "true" &&
    isSupabaseConfigured()
  )
}

export function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    )
  }

  return { url, publishableKey }
}

export function getSiteUrl() {
  const previewDeploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === "true"
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Preview deployments should send confirmation and recovery links back to
  // their own deployment, never to the public site.
  const preferredUrl =
    isStaging && previewDeploymentUrl
      ? `https://${previewDeploymentUrl}`
      : configuredUrl

  if (!preferredUrl) {
    return "http://localhost:3000"
  }

  try {
    return new URL(preferredUrl).origin
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a valid absolute URL, for example https://ushce.com.",
    )
  }
}
