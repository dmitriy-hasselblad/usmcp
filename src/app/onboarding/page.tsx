import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BriefcaseBusiness, Stethoscope } from "lucide-react"

import { completeOnboarding } from "@/app/auth/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProfessionSpecialtyFields } from "@/components/forms/profession-specialty-fields"
import {
  careerStages,
  organizationTypes,
  usStates,
} from "@/lib/auth/validation"
import { requireIdentity } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Complete your role-aware SM VIA account profile.",
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  error?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { supabase, userId, email } = await requireIdentity("/onboarding")
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type, first_name, last_name, onboarding_completed")
    .eq("id", userId)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/dashboard")
  }

  if (profileError || !profile) {
    return (
      <AuthPageShell
        description="The account exists, but its profile record could not be loaded."
        eyebrow="Setup required"
        footer={
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="link">
              Sign out
            </Button>
          </form>
        }
        title="Profile setup is unavailable"
      >
        <AuthNotice error="Apply the SM VIA Supabase database schema, then sign in again." />
      </AuthPageShell>
    )
  }

  const isProfessional = profile.account_type === "professional"

  return (
    <AuthPageShell
      description={
        isProfessional
          ? "Tell us where you are in your healthcare career."
          : "Tell us about your organization and hiring role."
      }
      eyebrow="One final step"
      footer={
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="link">
            Sign out and finish later
          </Button>
        </form>
      }
      title="Complete your profile"
      wide
    >
      <AuthNotice error={firstValue(params.error)} />
      <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
          {isProfessional ? (
            <Stethoscope className="size-5" />
          ) : (
            <BriefcaseBusiness className="size-5" />
          )}
        </span>
        <div>
          <p className="text-sm font-semibold">
            {isProfessional
              ? "Healthcare professional account"
              : "Employer or recruiter account"}
          </p>
          {email && (
            <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      </div>

      <form action={completeOnboarding} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            First name
            <Input
              autoComplete="given-name"
              className="h-11"
              defaultValue={profile.first_name ?? ""}
              maxLength={80}
              minLength={2}
              name="firstName"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Last name
            <Input
              autoComplete="family-name"
              className="h-11"
              defaultValue={profile.last_name ?? ""}
              maxLength={80}
              minLength={2}
              name="lastName"
              required
            />
          </label>
        </div>

        {isProfessional ? (
          <>
            <ProfessionSpecialtyFields specialtyLabel="Specialty or focus area" />
            <label className="grid gap-2 text-sm font-medium">
              Career stage
              <select className={selectClassName} name="careerStage" required>
                <option value="">Select your career stage</option>
                {careerStages.map((careerStage) => (
                  <option key={careerStage} value={careerStage}>
                    {careerStage}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              LinkedIn profile <span className="font-normal text-muted-foreground">Optional</span>
              <Input
                className="h-11"
                maxLength={300}
                name="linkedinUrl"
                placeholder="https://www.linkedin.com/in/your-name"
                type="url"
              />
              <span className="text-xs font-normal text-muted-foreground">Employers can view this after you apply.</span>
            </label>
          </>
        ) : (
          <>
            <label className="grid gap-2 text-sm font-medium">
              Organization name
              <Input
                autoComplete="organization"
                className="h-11"
                maxLength={160}
                minLength={2}
                name="organizationName"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Organization type
              <select className={selectClassName} name="organizationType" required>
                <option value="">Select the organization type</option>
                {organizationTypes.map((organizationType) => (
                  <option key={organizationType} value={organizationType}>
                    {organizationType}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Your position
              <Input
                autoComplete="organization-title"
                className="h-11"
                maxLength={120}
                minLength={2}
                name="positionTitle"
                placeholder="For example, Talent Acquisition Director"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Organization LinkedIn page <span className="font-normal text-muted-foreground">Optional</span>
              <Input
                className="h-11"
                maxLength={300}
                name="organizationLinkedInUrl"
                placeholder="https://www.linkedin.com/company/your-organization"
                type="url"
              />
            </label>
          </>
        )}

        <label className="grid gap-2 text-sm font-medium">
          Primary U.S. state
          <select
            autoComplete="address-level1"
            className={selectClassName}
            name="stateCode"
            required
          >
            <option value="">Select a state</option>
            {usStates.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <AuthSubmitButton pendingLabel="Saving profile...">
          Complete profile
        </AuthSubmitButton>
      </form>
    </AuthPageShell>
  )
}
