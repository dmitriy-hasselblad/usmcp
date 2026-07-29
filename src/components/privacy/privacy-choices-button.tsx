"use client"

import { useCookieConsent } from "@/components/privacy/cookie-consent-provider"
import { cn } from "@/lib/utils"

export function PrivacyChoicesButton({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent()

  return (
    <button
      className={cn(
        "text-left text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      onClick={openPreferences}
      type="button"
    >
      Privacy choices
    </button>
  )
}
