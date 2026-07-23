import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  FileText,
  MapPin,
  Stethoscope,
} from "lucide-react"
import { redirect } from "next/navigation"

import { withdrawApplication } from "@/app/applications/actions"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  withdrawableApplicationStatuses,
  type ApplicationRecord,
} from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Applications",
  description: "Manage healthcare job applications through USHCE.",
}

type SearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [identity, params] = await Promise.all([
    requireIdentity("/dashboard/applications"),
    searchParams,
  ])
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type === "employer") {
    return <EmployerApplications params={params} />
  }

  const { data } = await identity.supabase
    .from("applications")
    .select("*")
    .eq("candidate_id", identity.userId)
    .order("submitted_at", { ascending: false })
  const applications = (data ?? []) as ApplicationRecord[]

  return (
    <ProfessionalDashboardShell active="applications" email={identity.email}>
      <PageHeading
        description="Track every application and see its current hiring status."
        eyebrow="Career activity"
        title="My applications"
      />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(params.error)}
          success={firstValue(params.success)}
        />
      </div>

      {applications.length ? (
        <div className="mt-6 grid gap-4">
          {applications.map((application) => (
            <Card className="bg-white" key={application.id}>
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-[-0.03em]">
                      {application.job_title}
                    </h2>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <p className="mt-2 font-medium text-primary">
                    {application.organization_name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      Applied {formatDate(application.submitted_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {application.state_code}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button asChild variant="outline">
                    <Link href={`/jobs/${application.job_slug}`}>
                      View job
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/dashboard/applications/${application.id}`}>
                      View application <ArrowRight />
                    </Link>
                  </Button>
                  {withdrawableApplicationStatuses.includes(
                    application.status,
                  ) && (
                    <form action={withdrawApplication}>
                      <input
                        name="applicationId"
                        type="hidden"
                        value={application.id}
                      />
                      <Button type="submit" variant="destructive">
                        Withdraw
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyApplications
          description="When you apply for a live opportunity, its status will appear here."
          href="/jobs"
          label="Browse healthcare jobs"
          title="No applications yet"
        />
      )}
    </ProfessionalDashboardShell>
  )
}

async function EmployerApplications({
  params,
}: {
  params: Awaited<SearchParams>
}) {
  const workspace = await requireEmployerWorkspace("/dashboard/applications")
  const { data } = await workspace.supabase
    .from("applications")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("submitted_at", { ascending: false })
  const applications = (data ?? []) as ApplicationRecord[]

  return (
    <EmployerDashboardShell
      active="applications"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        description="Review professionals who applied to your organization's published opportunities."
        eyebrow="Hiring pipeline"
        title="Applicants"
      />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(params.error)}
          success={firstValue(params.success)}
        />
      </div>

      {applications.length ? (
        <div className="mt-6 grid gap-4">
          {applications.map((application) => (
            <Card className="bg-white" key={application.id}>
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-[-0.03em]">
                      {application.candidate_first_name}{" "}
                      {application.candidate_last_name}
                    </h2>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <p className="mt-2 font-medium text-primary">
                    {application.job_title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="size-4" />
                      {application.profession}
                      {application.specialty
                        ? ` · ${application.specialty}`
                        : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      Applied {formatDate(application.submitted_at)}
                    </span>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/applications/${application.id}`}>
                    Review applicant <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyApplications
          description="Applications from healthcare professionals will appear here as soon as they apply."
          href="/dashboard/jobs"
          label="Manage published jobs"
          title="No applicants yet"
        />
      )}
    </EmployerDashboardShell>
  )
}

function PageHeading({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function EmptyApplications({
  description,
  href,
  label,
  title,
}: {
  description: string
  href: string
  label: string
  title: string
}) {
  return (
    <Card className="mt-6 bg-white">
      <CardContent className="grid place-items-center px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary">
          <FileText className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <Button asChild className="mt-6">
          <Link href={href}>
            {label} <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
