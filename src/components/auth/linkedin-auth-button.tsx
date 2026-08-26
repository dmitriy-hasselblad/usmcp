"use client"

import { useState } from "react"

import { createClient } from "@/lib/supabase/client"

type LinkedInAuthButtonProps = {
  disabled?: boolean
  mode: "sign-in" | "sign-up"
  next?: string
}

function safeDestination(next: string | undefined, mode: LinkedInAuthButtonProps["mode"]) {
  if (mode === "sign-up") return "/onboarding"

  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard"
}

export function LinkedInAuthButton({
  disabled = false,
  mode,
  next,
}: LinkedInAuthButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function continueWithLinkedIn() {
    setError(null)
    setPending(true)

    const accountType = document.querySelector<HTMLInputElement>(
      'input[name="accountType"]:checked',
    )?.value
    const callback = new URL("/auth/confirm", window.location.origin)
    callback.searchParams.set("next", safeDestination(next, mode))

    if (mode === "sign-up" && (accountType === "professional" || accountType === "employer")) {
      callback.searchParams.set("account_type", accountType)
    }

    const { data, error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: callback.toString(),
      },
    })

    if (oauthError || !data.url) {
      setPending(false)
      setError("LinkedIn sign-in is not available right now. Please try again or use email and password.")
      return
    }

    window.location.assign(data.url)
  }

  return (
    <div className="grid gap-3">
      <button
        className="flex h-11 items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || pending}
        onClick={() => void continueWithLinkedIn()}
        type="button"
      >
        <LinkedInMark />
        {pending ? "Connecting to LinkedIn…" : "Continue with LinkedIn"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

function LinkedInMark() {
  return (
    <svg aria-hidden="true" className="size-5 text-[#0A66C2]" viewBox="0 0 24 24">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.5 3.72 3.5 4.66c0 .92.65 1.66 1.72 1.66h.02c1.1 0 1.77-.74 1.77-1.66C6.99 3.72 6.34 3 5.25 3ZM20.5 13.4c0-3.47-1.85-5.08-4.33-5.08-2 0-2.9 1.1-3.4 1.87V8.5H9.39c.04 1.12 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.25-.68.8-1.38 1.73-1.38 1.22 0 1.71.92 1.71 2.27V20h3.38l.78-6.6Z" fill="currentColor" />
    </svg>
  )
}
