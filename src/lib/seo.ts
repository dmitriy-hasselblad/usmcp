const fallbackSiteUrl = "https://smvia.org"

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  try {
    return new URL(configuredUrl || fallbackSiteUrl)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}

export function getAbsoluteUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString()
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
