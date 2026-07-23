import type { Metadata } from "next"
import Link from "next/link"
import { BriefcaseBusiness, Stethoscope } from "lucide-react"

import { signUp } from "@/app/auth/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Input } from "@/components/ui/input"
import { isAuthEnabled } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create a healthcare professional or employer account on USHCE.",
}

type SignUpSearchParams = Promise<{
  error?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SignUpSearchParams
}) {
  const params = await searchParams
  const error = firstValue(params.error)
  const configured = isAuthEnabled()

  return (
    <AuthPageShell
      description="Choose the workspace that matches your role in U.S. healthcare."
      eyebrow="Join the ecosystem"
      footer={
        <p>
          Already have an account?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      }
      title="Create your USHCE account"
      wide
    >
      <AuthNotice error={error} />
      {!configured && !error && (
        <AuthNotice error="Authentication is not configured for this deployment yet." />
      )}
      <form action={signUp} className="grid gap-5">
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative cursor-pointer">
              <input
                className="peer sr-only"
                defaultChecked
                disabled={!configured}
                name="accountType"
                type="radio"
                value="professional"
              />
              <span className="flex h-full gap-3 rounded-xl border border-border p-4 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <Stethoscope className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-semibold">
                    Healthcare professional
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Build your profile and explore career opportunities.
                  </span>
                </span>
              </span>
            </label>
            <label className="relative cursor-pointer">
              <input
                className="peer sr-only"
                disabled={!configured}
                name="accountType"
                type="radio"
                value="employer"
              />
              <span className="flex h-full gap-3 rounded-xl border border-border p-4 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <BriefcaseBusiness className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-semibold">Employer or recruiter</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Prepare your organization and healthcare hiring workspace.
                  </span>
                </span>
              </span>
            </label>
          </div>
        </fieldset>

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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Password
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
            Confirm password
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
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Use at least 8 characters. A confirmation link will be sent to your
          email address.
        </p>
        <AuthSubmitButton
          disabled={!configured}
          pendingLabel="Creating account..."
        >
          Create account
        </AuthSubmitButton>
      </form>
    </AuthPageShell>
  )
}
