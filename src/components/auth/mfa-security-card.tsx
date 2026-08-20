"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function MfaSecurityCard({ highlight = false }: { highlight?: boolean }) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.mfa.listFactors().then(({ data }) => {
      setEnabled(Boolean(data?.totp.some((factor) => factor.status === "verified")))
    })
  }, [])

  const title =
    enabled === true
      ? "Two-step verification is on"
      : "Protect your account with two-step verification"

  const description =
    enabled === true
      ? "Your authenticator app adds a second check when you sign in."
      : highlight
        ? "Recommended next step: use an authenticator app to add a second check when you sign in."
        : "Use an authenticator app to add a second check when you sign in."

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          <Button asChild className="mt-4" size="sm" variant={enabled ? "outline" : "default"}>
            <Link href="/dashboard/security">{enabled ? "Manage security" : "Set up now"}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
