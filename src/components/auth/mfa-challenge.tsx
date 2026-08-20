"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export function MfaChallenge({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit() {
    if (code.length !== 6) {
      setError("Enter the six-digit code from your authenticator app.")
      return
    }
    setPending(true)
    setError(null)
    const supabase = createClient()
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    const factor = factors?.totp.find((item) => item.status === "verified")
    if (factorsError || !factor) {
      setPending(false)
      setError("Your authenticator could not be found. Sign in again and try once more.")
      return
    }
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
    if (challengeError || !challenge) {
      setPending(false)
      setError("We could not verify that code. Please try again.")
      return
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code })
    if (verifyError) {
      setPending(false)
      setError("That code was not accepted. Check your authenticator app and try again.")
      return
    }
    router.replace(nextPath)
    router.refresh()
  }

  return <form action={() => void submit()} className="grid gap-5"><label className="grid gap-2 text-sm font-medium">Authenticator code<Input autoComplete="one-time-code" inputMode="numeric" maxLength={6} name="code" onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" required value={code} /></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<AuthSubmitButton disabled={pending} pendingLabel="Verifying…">Continue securely</AuthSubmitButton></form>
}
