"use client"

import { Analytics } from "@vercel/analytics/next"

import { useCookieConsent } from "@/components/privacy/cookie-consent-provider"

/**
 * Keeps optional analytics disabled until the visitor has explicitly allowed
 * the Analytics category in the SMVIA privacy choices.
 */
export function ConsentAwareAnalytics() {
  const { preferences } = useCookieConsent()

  if (!preferences?.analytics) {
    return null
  }

  return <Analytics />
}
