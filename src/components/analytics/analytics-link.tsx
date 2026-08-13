"use client"

import Link from "next/link"
import { track } from "@vercel/analytics"

import { useCookieConsent } from "@/components/privacy/cookie-consent-provider"

type AnalyticsLinkProps = React.ComponentProps<typeof Link> & {
  eventName: string
  eventData?: Record<string, string | number | boolean>
}

/** Records anonymous product intent only after the visitor enables Analytics. */
export function AnalyticsLink({
  eventName,
  eventData,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  const { preferences } = useCookieConsent()

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && preferences?.analytics) {
          track(eventName, eventData)
        }
      }}
    />
  )
}
