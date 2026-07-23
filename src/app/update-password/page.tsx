import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { updatePassword } from "@/app/auth/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Input } from "@/components/ui/input"
import { isAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Choose a New Password",
  description: "Update the password for your USHCE account.",
}

type SearchParams = Promise<{
  error?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const configured = isAuthEnabled()

  if (configured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    if (!data?.claims?.sub) {
      redirect(
        "/forgot-password?error=Open%20the%20secure%20link%20from%20your%20reset%20email.",
      )
    }
  }

  return (
    <AuthPageShell
      description="Choose a strong password you do not use on another website."
      eyebrow="Secure your account"
      footer={
        <Link className="font-semibold text-primary hover:underline" href="/sign-in">
          Return to sign in
        </Link>
      }
      title="Choose a new password"
    >
      <AuthNotice error={firstValue(params.error)} />
      {!configured && !firstValue(params.error) && (
        <AuthNotice error="Authentication is not configured for this deployment yet." />
      )}
      <form action={updatePassword} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          New password
          <Input
            autoComplete="new-password"
            className="h-11"
            disabled={!configured}
            maxLength={72}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Confirm new password
          <Input
            autoComplete="new-password"
            className="h-11"
            disabled={!configured}
            maxLength={72}
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
        <AuthSubmitButton
          disabled={!configured}
          pendingLabel="Updating password..."
        >
          Update password
        </AuthSubmitButton>
      </form>
    </AuthPageShell>
  )
}
