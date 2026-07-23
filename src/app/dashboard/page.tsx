import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Stethoscope,
  UserRound,
} from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your secure USHCE account workspace.",
}

export default async function DashboardPage() {
  const { supabase, userId, email } = await requireIdentity("/dashboard")
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, first_name, last_name, onboarding_completed")
    .eq("id", userId)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const isProfessional = profile.account_type === "professional"
  const { data: roleProfile } = isProfessional
    ? await supabase
        .from("professional_profiles")
        .select("profession, specialty, state_code, career_stage")
        .eq("user_id", userId)
        .single()
    : await supabase
        .from("employer_profiles")
        .select(
          "organization_name, organization_type, state_code, position_title",
        )
        .eq("user_id", userId)
        .single()

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="min-h-dvh bg-muted/35">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {email}
            </span>
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <Badge variant="outline">
          {isProfessional ? "Professional workspace" : "Employer workspace"}
        </Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
          Welcome, {profile.first_name}.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Your secure USHCE foundation is ready. The full dashboard modules will
          be added in the next implementation stage.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-border/80 bg-white">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                <UserRound className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
                Account profile
              </h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-semibold">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Account type</dt>
                  <dd className="mt-1 font-semibold">
                    {isProfessional
                      ? "Healthcare professional"
                      : "Employer or recruiter"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-700">
                {isProfessional ? (
                  <Stethoscope className="size-5" />
                ) : (
                  <Building2 className="size-5" />
                )}
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
                {isProfessional ? "Career profile" : "Organization profile"}
              </h2>
              {roleProfile ? (
                <RoleDetails
                  isProfessional={isProfessional}
                  roleProfile={roleProfile}
                />
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  The role-specific profile could not be loaded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-primary/10 bg-primary text-white">
          <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-semibold text-teal-100">Next step</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {isProfessional
                  ? "Explore healthcare opportunities"
                  : "Preview the employer experience"}
              </h2>
            </div>
            <Button
              asChild
              className="h-11 rounded-xl bg-white px-5 text-primary hover:bg-blue-50"
            >
              <Link href={isProfessional ? "/jobs" : "/for-employers"}>
                Continue <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function RoleDetails({
  isProfessional,
  roleProfile,
}: {
  isProfessional: boolean
  roleProfile: Record<string, unknown>
}) {
  const details = isProfessional
    ? [
        ["Profession", roleProfile.profession],
        ["Specialty", roleProfile.specialty || "Not specified"],
        ["Career stage", roleProfile.career_stage],
        ["State", roleProfile.state_code],
      ]
    : [
        ["Organization", roleProfile.organization_name],
        ["Organization type", roleProfile.organization_type],
        ["Position", roleProfile.position_title],
        ["State", roleProfile.state_code],
      ]

  return (
    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
      {details.map(([label, value]) => (
        <div key={String(label)}>
          <dt className="flex items-center gap-2 text-muted-foreground">
            {label === "State" ? (
              <MapPin className="size-3.5" />
            ) : (
              <BriefcaseBusiness className="size-3.5" />
            )}
            {String(label)}
          </dt>
          <dd className="mt-1 font-semibold">{String(value ?? "")}</dd>
        </div>
      ))}
    </dl>
  )
}
