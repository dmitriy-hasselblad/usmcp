import type { Metadata } from "next"
import Link from "next/link"

import { requestPasswordReset } from "@/app/auth/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Input } from "@/components/ui/input"
import { isAuthEnabled } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your USHCE account.",
}

type SearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const configured = isAuthEnabled()

  return (
    <AuthPageShell
      description="We will send a secure password reset link if the account exists."
      eyebrow="Account recovery"
      footer={
        <Link className="font-semibold text-primary hover:underline" href="/sign-in">
          Return to sign in
        </Link>
      }
      title="Reset your password"
    >
      <AuthNotice
        error={firstValue(params.error)}
        success={firstValue(params.success)}
      />
      {!configured && !firstValue(params.error) && (
        <AuthNotice error="Authentication is not configured for this deployment yet." />
      )}
      <form action={requestPasswordReset} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <Input
            autoComplete="email"
            className="h-11"
            disabled={!configured}
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <AuthSubmitButton
          disabled={!configured}
          pendingLabel="Sending reset link..."
        >
          Send reset link
        </AuthSubmitButton>
      </form>
    </AuthPageShell>
  )
}
