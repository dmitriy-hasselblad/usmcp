import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { notFound, redirect } from "next/navigation"

import {
  updateApplicationStatus,
  withdrawApplication,
} from "@/app/applications/actions"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  employerApplicationStatuses,
  withdrawableApplicationStatuses,
  type ApplicationRecord,
  type ApplicationStatus,
} from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Application details",
  description: "Review a healthcare job application in USHCE.",
}

type ApplicationPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    error?: string | string[]
    success?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export default async function ApplicationPage({
  params,
  searchParams,
}: ApplicationPageProps) {
  const [{ id }, query, identity] = await Promise.all([
    params,
    searchParams,
    requireIdentity("/dashboard/applications"),
  ])

  if (!isUuid(id)) {
    notFound()
  }

  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type === "employer") {
    return <EmployerApplication applicationId={id} query={query} />
  }

  const { data } = await identity.supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("candidate_id", identity.userId)
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const application = data as ApplicationRecord

  return (
    <ProfessionalDashboardShell active="applications" email={identity.email}>
      <BackLink />
      <ApplicationHeading application={application} perspective="candidate" />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <ApplicationBody application={application} />
        <Card className="h-fit bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Application status
            </p>
            <ApplicationStatusBadge
              className="mt-4"
              status={application.status}
            />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Submitted {formatDate(application.submitted_at)}. Status changes
              from the hiring team will appear here.
            </p>
            <Button asChild className="mt-5 w-full" variant="outline">
              <Link href={`/jobs/${application.job_slug}`}>View job</Link>
            </Button>
            {withdrawableApplicationStatuses.includes(application.status) && (
              <form action={withdrawApplication} className="mt-2">
                <input
                  name="applicationId"
                  type="hidden"
                  value={application.id}
                />
                <Button className="w-full" type="submit" variant="destructive">
                  Withdraw application
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfessionalDashboardShell>
  )
}

async function EmployerApplication({
  applicationId,
  query,
}: {
  applicationId: string
  query: Awaited<ApplicationPageProps["searchParams"]>
}) {
  const workspace = await requireEmployerWorkspace(
    `/dashboard/applications/${applicationId}`,
  )
  const { data } = await workspace.supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const application = data as ApplicationRecord
  const canEdit = canManageJobs(workspace.membership.role)

  return (
    <EmployerDashboardShell
      active="applications"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <BackLink />
      <ApplicationHeading application={application} perspective="employer" />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <ApplicationBody application={application} showCandidateContact />
        <Card className="h-fit bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Hiring status
            </p>
            <ApplicationStatusBadge
              className="mt-4"
              status={application.status}
            />
            {application.status === "withdrawn" ? (
              <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                The candidate withdrew this application. Its status can no
                longer be changed.
              </p>
            ) : canEdit ? (
              <form action={updateApplicationStatus} className="mt-5 grid gap-3">
                <input
                  name="applicationId"
                  type="hidden"
                  value={application.id}
                />
                <label className="grid gap-2 text-sm font-medium">
                  Update status
                  <select
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                    defaultValue={application.status}
                    name="status"
                  >
                    {employerApplicationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit">Save status</Button>
              </form>
            ) : (
              <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                Your workspace role has view-only access to applicant statuses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployerDashboardShell>
  )
}

function ApplicationHeading({
  application,
  perspective,
}: {
  application: ApplicationRecord
  perspective: "candidate" | "employer"
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
        {perspective === "candidate" ? "Your application" : "Applicant review"}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
        {perspective === "candidate"
          ? application.job_title
          : `${application.candidate_first_name} ${application.candidate_last_name}`}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {perspective === "candidate"
          ? application.organization_name
          : `Applied for ${application.job_title}`}
      </p>
    </div>
  )
}

function ApplicationBody({
  application,
  showCandidateContact = false,
}: {
  application: ApplicationRecord
  showCandidateContact?: boolean
}) {
  return (
    <div className="grid gap-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>
            {showCandidateContact ? "Candidate profile" : "Application profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail
              icon={UserRound}
              label="Candidate"
              value={`${application.candidate_first_name} ${application.candidate_last_name}`}
            />
            <Detail
              icon={Stethoscope}
              label="Profession"
              value={`${application.profession}${
                application.specialty ? ` · ${application.specialty}` : ""
              }`}
            />
            <Detail
              icon={BriefcaseBusiness}
              label="Career stage"
              value={application.career_stage}
            />
            <Detail
              icon={MapPin}
              label="U.S. state"
              value={application.state_code}
            />
            <Detail
              icon={CalendarDays}
              label="Submitted"
              value={formatDate(application.submitted_at)}
            />
          </dl>
          {showCandidateContact && (
            <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <Button asChild variant="outline">
                <a href={`mailto:${application.candidate_email}`}>
                  <Mail /> Email candidate
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${application.phone}`}>
                  <Phone /> {application.phone}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Message to the hiring team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
            {application.cover_letter}
          </p>
        </CardContent>
      </Card>

      {application.resume_url && (
        <Card className="bg-white">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Resume or CV</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open the document link supplied with this application.
              </p>
            </div>
            <Button asChild>
              <a
                href={application.resume_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open document <ExternalLink />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="mt-1.5 font-semibold">{value}</dd>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      href="/dashboard/applications"
    >
      <ArrowLeft className="size-4" />
      Back to applications
    </Link>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function statusLabel(status: ApplicationStatus) {
  const labels: Record<ApplicationStatus, string> = {
    submitted: "Submitted",
    reviewing: "In review",
    interview: "Interview",
    offer: "Offer",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
  }

  return labels[status]
}
