export const COOKIE_CONSENT_NAME = "ushce_cookie_consent"
export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180
export const COOKIE_CONSENT_EVENT = "ushce:cookie-consent-updated"

export type CookieConsentSource = "banner" | "preferences" | "gpc"

export type CookiePreferences = {
  version: typeof COOKIE_CONSENT_VERSION
  essential: true
  functional: boolean
  analytics: boolean
  advertising: boolean
  updatedAt: string
  source: CookieConsentSource
}

export type OptionalCookiePreferences = Pick<
  CookiePreferences,
  "functional" | "analytics" | "advertising"
>

export const defaultOptionalCookiePreferences: OptionalCookiePreferences = {
  functional: false,
  analytics: false,
  advertising: false,
}

export function createCookiePreferences(
  optionalPreferences: OptionalCookiePreferences,
  source: CookieConsentSource
): CookiePreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    ...optionalPreferences,
    updatedAt: new Date().toISOString(),
    source,
  }
}

export function readCookiePreferences(
  cookieHeader: string
): CookiePreferences | null {
  const value = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_NAME}=`))
    ?.slice(COOKIE_CONSENT_NAME.length + 1)

  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(
      decodeURIComponent(value)
    ) as Partial<CookiePreferences>

    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      parsed.essential !== true ||
      typeof parsed.functional !== "boolean" ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.advertising !== "boolean" ||
      typeof parsed.updatedAt !== "string" ||
      !["banner", "preferences", "gpc"].includes(parsed.source ?? "")
    ) {
      return null
    }

    return parsed as CookiePreferences
  } catch {
    return null
  }
}

export function persistCookiePreferences(preferences: CookiePreferences) {
  const secureAttribute =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : ""

  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
    JSON.stringify(preferences)
  )}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE}; SameSite=Lax${secureAttribute}`

  window.dispatchEvent(
    new CustomEvent<CookiePreferences>(COOKIE_CONSENT_EVENT, {
      detail: preferences,
    })
  )
}
