import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Handshake,
  UsersRound,
} from "lucide-react"

import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getHiringInsights,
  type HiringInsightApplication,
  type HiringInsightJob,
} from "@/lib/employer/hiring-insights"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Hiring insights",
  description: "Review your organization's application pipeline.",
}

const funnelSteps = [
  { key: "submitted", label: "Submitted", tone: "bg-blue-500" },
  { key: "reviewing", label: "In review", tone: "bg-amber-500" },
  { key: "interview", label: "Interview", tone: "bg-violet-500" },
  { key: "offer", label: "Offer", tone: "bg-emerald-500" },
] as const

export default async function HiringInsightsPage() {
  const workspace = await requireEmployerWorkspace("/dashboard/insights")
  const [{ data: applicationData }, { data: jobData }] = await Promise.all([
    workspace.supabase
      .from("applications")
      .select("id, candidate_id, job_id, job_title, status, submitted_at")
      .eq("organization_id", workspace.organization.id)
      .order("submitted_at", { ascending: false }),
    workspace.supabase
      .from("jobs")
      .select("id, title, status")
      .eq("organization_id", workspace.organization.id),
  ])
  const insights = getHiringInsights(
    (applicationData ?? []) as HiringInsightApplication[],
    (jobData ?? []) as HiringInsightJob[],
  )
  const maxFunnelValue = Math.max(
    1,
    ...funnelSteps.map((step) => insights.statusCounts.get(step.key) ?? 0),
  )

  return (
    <EmployerDashboardShell
      active="insights"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        action={
          <Button asChild className="h-10 rounded-xl px-4" variant="outline">
            <Link href="/dashboard/applications">
              Review applicants <ArrowRight />
            </Link>
          </Button>
        }
        description="A privacy-safe summary of application activity for your organization. Individual candidate details remain in Applicant review."
        eyebrow="Hiring activity"
        title="Hiring insights"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={FileText}
          label="Applications"
          detail={`${insights.applicationsLast30Days} in the last 30 days`}
          value={insights.totalApplications}
        />
        <InsightCard
          icon={UsersRound}
          label="Active candidates"
          detail="Submitted, in review, or interview"
          tone="teal"
          value={insights.activeCandidates}
        />
        <InsightCard
          icon={BriefcaseBusiness}
          label="Published jobs"
          detail="Currently accepting applications"
          tone="amber"
          value={insights.activeJobs}
        />
        <InsightCard
          icon={Handshake}
          label="Offers"
          detail="Current application status"
          tone="green"
          value={insights.offers}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold tracking-[-0.03em]">
              Application pipeline
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Current status of applications received by your organization.
            </p>
            <div className="mt-7 grid gap-5">
              {funnelSteps.map((step) => {
                const value = insights.statusCounts.get(step.key) ?? 0
                return (
                  <div key={step.key}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">{step.label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${step.tone}`}
                        style={{ width: `${(value / maxFunnelValue) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-0">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold tracking-[-0.03em]">
                Applications by job
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                See where your current applicant activity is concentrated.
              </p>
            </div>
            {insights.jobRows.length ? (
              <div className="divide-y divide-border">
                {insights.jobRows.map((job) => (
                  <div
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
                    key={job.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{job.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.active} active · {job.interviews} interview
                        {job.interviews === 1 ? "" : "s"} · {job.offers} offer
                        {job.offers === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {job.applications} application{job.applications === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold">No application activity yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  This report will begin to populate when candidates apply to
                  your published jobs.
                </p>
                <Button asChild className="mt-5" variant="outline">
                  <Link href="/dashboard/jobs">Manage jobs</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
        This Early Access report uses application records only. It does not
        expose visitor identity, page-view tracking, or private candidate data.
      </p>
    </EmployerDashboardShell>
  )
}

function InsightCard({
  detail,
  icon: Icon,
  label,
  tone = "blue",
  value,
}: {
  detail: string
  icon: typeof FileText
  label: string
  tone?: "blue" | "teal" | "amber" | "green"
  value: number
}) {
  const tones = {
    blue: "bg-blue-50 text-primary",
    teal: "bg-teal-100 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  }

  return (
    <Card className="bg-white">
      <CardContent className="flex gap-4 p-5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}
