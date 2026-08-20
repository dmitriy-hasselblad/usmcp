"use client"

import { useState } from "react"

import { createClient } from "@/lib/supabase/client"

type GoogleAuthButtonProps = {
  disabled?: boolean
  mode: "sign-in" | "sign-up"
  next?: string
}

function safeDestination(next: string | undefined, mode: GoogleAuthButtonProps["mode"]) {
  if (mode === "sign-up") return "/onboarding"

  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard"
}

export function GoogleAuthButton({
  disabled = false,
  mode,
  next,
}: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function continueWithGoogle() {
    setError(null)
    setPending(true)

    const accountType = document.querySelector<HTMLInputElement>(
      'input[name="accountType"]:checked',
    )?.value
    const destination = safeDestination(next, mode)
    const callback = new URL("/auth/confirm", window.location.origin)
    callback.searchParams.set("next", destination)

    if (mode === "sign-up" && (accountType === "professional" || accountType === "employer")) {
      callback.searchParams.set("account_type", accountType)
    }

    const { data, error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
      },
    })

    if (oauthError || !data.url) {
      setPending(false)
      setError("Google sign-in is not available right now. Please try again or use email and password.")
      return
    }

    window.location.assign(data.url)
  }

  return (
    <div className="grid gap-3">
      <button
        className="flex h-11 items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || pending}
        onClick={() => void continueWithGoogle()}
        type="button"
      >
        <GoogleMark />
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M21.35 12.27c0-.78-.07-1.53-.2-2.25H12v4.26h5.23a4.47 4.47 0 0 1-1.94 2.93v2.76h3.56c2.08-1.92 3.3-4.74 3.3-7.7Z" fill="#4285F4" />
      <path d="M12 21.76c2.62 0 4.82-.87 6.43-2.36l-3.56-2.76c-.87.58-1.98.93-2.87.93-2.42 0-4.47-1.63-5.2-3.83H3.13v2.85A9.72 9.72 0 0 0 12 21.76Z" fill="#34A853" />
      <path d="M6.8 13.74a5.8 5.8 0 0 1 0-3.48V7.41H3.13a9.73 9.73 0 0 0 0 9.18l3.67-2.85Z" fill="#FBBC05" />
      <path d="M12 6.43c1.52 0 2.88.52 3.95 1.54l2.96-2.96C16.82 3.07 14.62 2.24 12 2.24a9.72 9.72 0 0 0-8.87 5.17l3.67 2.85c.73-2.2 2.78-3.83 5.2-3.83Z" fill="#EA4335" />
    </svg>
  )
}
