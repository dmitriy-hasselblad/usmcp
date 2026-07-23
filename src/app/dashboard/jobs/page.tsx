import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
} from "lucide-react"

import { changeJobStatus } from "@/app/dashboard/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { JobStatusBadge } from "@/components/employer/job-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  canManageJobs,
  type JobStatus,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage your organization's USHCE jobs.",
}

type SearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [workspace, params] = await Promise.all([
    requireEmployerWorkspace("/dashboard/jobs"),
    searchParams,
  ])
  const { data: jobs } = await workspace.supabase
    .from("jobs")
    .select(
      "id, title, specialty, city, state_code, employment_type, workplace_type, status, created_at",
    )
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false })
  const canEdit = canManageJobs(workspace.membership.role)

  return (
    <EmployerDashboardShell
      active="jobs"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        action={
          canEdit ? (
            <Button asChild className="h-10 rounded-xl px-4">
              <Link href="/dashboard/jobs/new">
                Create job <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
        description="Create, review, and control the status of your organization's healthcare opportunities."
        eyebrow="Hiring"
        title="Jobs"
      />

      <div className="mt-7">
        <AuthNotice
          error={firstValue(params.error)}
          success={firstValue(params.success)}
        />
      </div>

      {jobs?.length ? (
        <div className="mt-6 grid gap-4">
          {jobs.map((job) => (
            <Card className="bg-white" key={job.id}>
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="truncate text-lg font-semibold tracking-[-0.03em]">
                      {job.title}
                    </h2>
                    <JobStatusBadge status={job.status as JobStatus} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {job.city}, {job.state_code}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BriefcaseBusiness className="size-4" />
                      {job.employment_type} · {job.workplace_type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      Created{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(job.created_at))}
                    </span>
                  </div>
                  {job.specialty && (
                    <p className="mt-3 text-sm font-medium text-primary">
                      {job.specialty}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <StatusActions
                    jobId={job.id}
                    status={job.status as JobStatus}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6 bg-white">
          <CardContent className="grid place-items-center px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary">
              <BriefcaseBusiness className="size-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Create your first job</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Start with a private draft. You can publish it to your workspace
              when the details are ready.
            </p>
            {canEdit && (
              <Button asChild className="mt-6">
                <Link href="/dashboard/jobs/new">Create job draft</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </EmployerDashboardShell>
  )
}

function StatusActions({
  jobId,
  status,
}: {
  jobId: string
  status: JobStatus
}) {
  const transitions: Partial<Record<JobStatus, JobStatus[]>> = {
    draft: ["published"],
    published: ["paused", "closed"],
    paused: ["published", "closed"],
    closed: ["draft"],
  }

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {transitions[status]?.map((nextStatus) => (
        <form action={changeJobStatus} key={nextStatus}>
          <input name="jobId" type="hidden" value={jobId} />
          <input name="status" type="hidden" value={nextStatus} />
          <Button
            type="submit"
            variant={nextStatus === "published" ? "default" : "outline"}
          >
            {nextStatus === "published"
              ? "Publish"
              : nextStatus === "draft"
                ? "Reopen as draft"
                : nextStatus === "paused"
                  ? "Pause"
                  : "Close"}
          </Button>
        </form>
      ))}
    </div>
  )
}
