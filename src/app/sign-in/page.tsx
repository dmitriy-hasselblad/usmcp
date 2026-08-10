import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { signIn, startSocialSignIn } from "@/app/auth/actions"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Input } from "@/components/ui/input"
import { isAuthEnabled, isSocialAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your USHCE account.",
}

type SignInSearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
  next?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SignInSearchParams
}) {
  const params = await searchParams
  const error = firstValue(params.error)
  const success = firstValue(params.success)
  const next = firstValue(params.next)
  const configured = isAuthEnabled()
  const socialConfigured = isSocialAuthEnabled()

  if (configured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    if (data?.claims?.sub) {
      redirect("/dashboard")
    }
  }

  return (
    <AuthPageShell
      description="Access your professional or employer workspace."
      eyebrow="Welcome back"
      footer={
        <p>
          New to USHCE?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/sign-up">
            Create an account
          </Link>
        </p>
      }
      title="Sign in to USHCE"
    >
      <AuthNotice error={error} success={success} />
      {!configured && !error && (
        <AuthNotice error="Authentication is not configured for this deployment yet." />
      )}
      <form action={signIn} className="grid gap-4">
        {next && <input name="next" type="hidden" value={next} />}
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
        <label className="grid gap-2 text-sm font-medium">
          <span className="flex items-center justify-between gap-4">
            Password
            <Link
              className="text-xs font-semibold text-primary hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </span>
          <Input
            autoComplete="current-password"
            className="h-11"
            disabled={!configured}
            maxLength={72}
            name="password"
            required
            type="password"
          />
        </label>
        <AuthSubmitButton
          disabled={!configured}
          pendingLabel="Signing in..."
        >
          Sign in
        </AuthSubmitButton>
        {socialConfigured ? <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-semibold hover:bg-muted" formAction={startSocialSignIn} name="provider" type="submit" value="google">Google</button>
            <button className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-semibold hover:bg-muted" formAction={startSocialSignIn} name="provider" type="submit" value="linkedin_oidc">LinkedIn</button>
          </div>
        </> : null}
      </form>
    </AuthPageShell>
  )
}
