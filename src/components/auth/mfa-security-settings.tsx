"use client"

import { CheckCircle2, Copy, KeyRound, ShieldCheck, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Factor = {
  id: string
  friendly_name?: string
  status: "verified" | "unverified"
}

export function MfaSecuritySettings() {
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadFactors = useCallback(async () => {
    const { data, error: listError } = await createClient().auth.mfa.listFactors()
    if (listError) {
      setError("We could not load your security settings. Please try again.")
      return
    }
    setFactors((data?.totp ?? []) as Factor[])
  }, [])

  useEffect(() => {
    let mounted = true

    void (async () => {
      const { data, error: listError } = await createClient().auth.mfa.listFactors()
      if (!mounted) return
      if (listError) {
        setError("We could not load your security settings. Please try again.")
      } else {
        setFactors((data?.totp ?? []) as Factor[])
      }
      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [])

  async function beginEnrollment() {
    setBusy(true)
    setError(null)
    setSuccess(null)
    const supabase = createClient()
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    })
    setBusy(false)
    if (enrollError || !data?.totp?.qr_code) {
      setError("We could not start two-step verification. Please try again.")
      return
    }
    setFactorId(data.id)
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
  }

  async function verifyEnrollment() {
    if (!factorId || code.trim().length !== 6) {
      setError("Enter the six-digit code from your authenticator app.")
      return
    }
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError || !challenge) {
      setBusy(false)
      setError("We could not verify that code. Please try again.")
      return
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    })
    setBusy(false)
    if (verifyError) {
      setError("That code was not accepted. Check your authenticator app and try again.")
      return
    }
    setFactorId(null)
    setQrCode(null)
    setSecret(null)
    setCode("")
    setSuccess("Two-step verification is now protecting this account.")
    await loadFactors()
  }

  async function cancelEnrollment() {
    if (factorId) await createClient().auth.mfa.unenroll({ factorId })
    setFactorId(null)
    setQrCode(null)
    setSecret(null)
    setCode("")
    setError(null)
  }

  async function removeFactor(id: string) {
    if (!window.confirm("Turn off this authenticator? You will no longer be asked for a second code when signing in.")) return
    setBusy(true)
    setError(null)
    const { error: removeError } = await createClient().auth.mfa.unenroll({ factorId: id })
    setBusy(false)
    if (removeError) {
      setError("We could not remove this authenticator. Please try again.")
      return
    }
    setSuccess("Two-step verification was turned off for this authenticator.")
    await loadFactors()
  }

  const verifiedFactors = factors.filter((factor) => factor.status === "verified")

  if (loading) return <p className="text-sm text-muted-foreground">Loading security settings…</p>

  return (
    <div className="grid gap-6">
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}

      {verifiedFactors.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-950">Two-step verification is active</p>
              <p className="mt-1 text-sm leading-6 text-emerald-900/80">You will enter a code from your authenticator app after your password when signing in.</p>
            </div>
          </div>
        </div>
      )}

      {!factorId ? (
        <div className="rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-semibold"><KeyRound className="size-5 text-primary" />Authenticator app</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Use Google Authenticator, Microsoft Authenticator, 1Password, Authy, or another compatible app. We recommend adding a backup authenticator on a different device.</p>
            </div>
            <Button disabled={busy} onClick={beginEnrollment} type="button">Add authenticator</Button>
          </div>
          {verifiedFactors.length > 0 && (
            <div className="mt-5 grid gap-3 border-t border-border pt-5">
              {verifiedFactors.map((factor, index) => (
                <div className="flex flex-wrap items-center justify-between gap-3" key={factor.id}>
                  <span className="text-sm font-medium">{factor.friendly_name || `Authenticator ${index + 1}`}</span>
                  <Button disabled={busy} onClick={() => void removeFactor(factor.id)} size="sm" type="button" variant="outline"><Trash2 />Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-primary">Step 1 of 2</p>
          <h2 className="mt-2 text-xl font-semibold">Scan the QR code with your authenticator app</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Then enter the current six-digit code to confirm it is working.</p>
          {qrCode && (
            // The Supabase MFA API returns a private inline SVG, not a hosted image.
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="QR code for SM VIA two-step verification" className="mt-5 size-48 rounded-xl border border-border bg-white p-3" src={qrCode} />
          )}
          {secret && <div className="mt-5 rounded-xl bg-muted p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Can’t scan the code?</p><p className="mt-2 break-all font-mono text-sm">{secret}</p><Button className="mt-3" onClick={() => void navigator.clipboard.writeText(secret)} size="sm" type="button" variant="outline"><Copy />Copy setup key</Button></div>}
          <label className="mt-6 grid max-w-xs gap-2 text-sm font-medium">Six-digit code<Input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" value={code} /></label>
          <div className="mt-5 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void verifyEnrollment()} type="button">{busy ? "Verifying…" : "Enable two-step verification"}</Button><Button disabled={busy} onClick={() => void cancelEnrollment()} type="button" variant="outline">Cancel</Button></div>
        </div>
      )}

      <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" />SM VIA does not store your authenticator codes. If you lose access to your only authenticator, account recovery may require support review.</p>
    </div>
  )
}
