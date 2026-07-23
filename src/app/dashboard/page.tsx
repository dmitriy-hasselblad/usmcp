import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { JobStatusBadge } from "@/components/employer/job-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"
import type { JobStatus } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your secure USHCE account workspace.",
}

export default async function DashboardPage() {
  const identity = await requireIdentity("/dashboard")
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, first_name, last_name, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type === "employer") {
    return <EmployerOverview />
  }

  return (
    <ProfessionalDashboard
      email={identity.email}
      firstName={profile.first_name}
      fullName={[profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ")}
      supabase={identity.supabase}
      userId={identity.userId}
    />
  )
}

async function EmployerOverview() {
  const workspace = await requireEmployerWorkspace("/dashboard")
  const organizationId = workspace.organization.id

  const [
    { count: totalJobs },
    { count: publishedJobs },
    { count: draftJobs },
    { count: teamMembers },
    { data: recentJobs },
  ] = await Promise.all([
    workspace.supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    workspace.supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "published"),
    workspace.supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "draft"),
    workspace.supabase
      .from("organization_members")
      .select("user_id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    workspace.supabase
      .from("jobs")
      .select(
        "id, title, city, state_code, status, employment_type, created_at",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <EmployerDashboardShell
      active="overview"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        action={
          <Button asChild className="h-10 rounded-xl px-4">
            <Link href="/dashboard/jobs/new">
              Create job <ArrowRight />
            </Link>
          </Button>
        }
        description="Manage your organization, hiring activity, and team from one secure workspace."
        eyebrow="Employer overview"
        title={`Welcome, ${workspace.profile.first_name ?? "there"}.`}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Total jobs"
          value={totalJobs ?? 0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Published"
          tone="green"
          value={publishedJobs ?? 0}
        />
        <StatCard
          icon={FileText}
          label="Drafts"
          tone="amber"
          value={draftJobs ?? 0}
        />
        <StatCard
          icon={UsersRound}
          label="Team members"
          tone="teal"
          value={teamMembers ?? 0}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
        <Card className="bg-white">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em]">
                  Recent jobs
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest hiring activity
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/jobs">View all</Link>
              </Button>
            </div>
            {recentJobs?.length ? (
              <div className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <div
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    key={job.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{job.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {job.city}, {job.state_code} · {job.employment_type}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status as JobStatus} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyJobs />
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex h-full flex-col p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-white/10">
              <Building2 className="size-5" />
            </span>
            <p className="mt-6 text-sm font-semibold text-teal-100">
              Organization profile
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {workspace.organization.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              Complete your public employer information before the job
              marketplace launches.
            </p>
            <Button
              asChild
              className="mt-auto h-10 bg-white text-primary hover:bg-blue-50"
            >
              <Link href="/dashboard/organization">
                Manage profile <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </EmployerDashboardShell>
  )
}

function StatCard({
  icon: Icon,
  label,
  tone = "blue",
  value,
}: {
  icon: typeof BriefcaseBusiness
  label: string
  tone?: "blue" | "green" | "amber" | "teal"
  value: number
}) {
  const tones = {
    blue: "bg-blue-50 text-primary",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-teal-50 text-teal-700",
  }

  return (
    <Card className="bg-white">
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyJobs() {
  return (
    <div className="grid place-items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <BriefcaseBusiness className="size-5" />
      </span>
      <h3 className="mt-4 font-semibold">No jobs yet</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Create your first job as a draft. You can review it before publishing.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard/jobs/new">Create first job</Link>
      </Button>
    </div>
  )
}

async function ProfessionalDashboard({
  email,
  firstName,
  fullName,
  supabase,
  userId,
}: {
  email?: string
  firstName: string | null
  fullName: string
  supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"]
  userId: string
}) {
  const { data: roleProfile } = await supabase
    .from("professional_profiles")
    .select("profession, specialty, state_code, career_stage")
    .eq("user_id", userId)
    .single()

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
        <Badge variant="outline">Professional workspace</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
          Welcome, {firstName}.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Your secure USHCE profile is ready. Career tools will be added in the
          next professional workspace stage.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="bg-white">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                <UserRound className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Account profile</h2>
              <p className="mt-5 text-sm text-muted-foreground">Name</p>
              <p className="mt-1 font-semibold">{fullName}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-700">
                <Stethoscope className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Career profile</h2>
              {roleProfile ? (
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Profession", roleProfile.profession],
                    ["Specialty", roleProfile.specialty || "Not specified"],
                    ["Career stage", roleProfile.career_stage],
                    ["State", roleProfile.state_code],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="mt-1 font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  The career profile could not be loaded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-primary text-white">
          <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-semibold text-teal-100">Next step</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Explore healthcare opportunities
              </h2>
            </div>
            <Button asChild className="bg-white text-primary hover:bg-blue-50">
              <Link href="/jobs">
                Browse jobs <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
