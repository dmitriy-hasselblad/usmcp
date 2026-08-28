export function normalizeLinkedInUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const host = url.hostname.toLowerCase()
    const isLinkedInHost = host === "linkedin.com" || host === "www.linkedin.com"

    if (url.protocol !== "https:" || !isLinkedInHost || url.pathname === "/") {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}
