import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Handshake,
  MessagesSquare,
} from "lucide-react"

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ApplicationStatus } from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import {
  getApplicationInsights,
  type ProfessionalInsightApplication,
} from "@/lib/professional/application-insights"

export const metadata: Metadata = {
  title: "Application insights",
  description: "Review your private application progress.",
}

const funnelSteps: Array<{
  key: ApplicationStatus
  label: string
  tone: string
}> = [
  { key: "submitted", label: "Submitted", tone: "bg-blue-500" },
  { key: "reviewing", label: "In review", tone: "bg-amber-500" },
  { key: "interview", label: "Interview", tone: "bg-violet-500" },
  { key: "offer", label: "Offer", tone: "bg-emerald-500" },
]

export default async function ApplicationInsightsPage() {
  const identity = await requireIdentity("/dashboard/application-insights")
  const { data: applicationData } = await identity.supabase
    .from("applications")
    .select("id, job_title, organization_name, status, submitted_at, updated_at")
    .eq("candidate_id", identity.userId)
    .order("submitted_at", { ascending: false })

  const insights = getApplicationInsights(
    (applicationData ?? []) as ProfessionalInsightApplication[],
  )
  const maxFunnelValue = Math.max(
    1,
    ...funnelSteps.map((step) => insights.statusCounts.get(step.key) ?? 0),
  )

  return (
    <ProfessionalDashboardShell active="insights" email={identity.email}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Career activity
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Application insights
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A private summary of your application progress. Only you can see
            this report.
          </p>
        </div>
        <Button asChild className="h-10 w-fit rounded-xl px-4" variant="outline">
          <Link href="/dashboard/applications">
            View applications <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          detail={`${insights.applicationsLast30Days} in the last 30 days`}
          icon={FileText}
          label="Applications"
          value={insights.totalApplications}
        />
        <InsightCard
          detail="Submitted, in review, or interview"
          icon={BriefcaseBusiness}
          label="Active applications"
          tone="teal"
          value={insights.activeApplications}
        />
        <InsightCard
          detail="Interviews in your current status overview"
          icon={MessagesSquare}
          label="Interviews"
          tone="amber"
          value={insights.interviews}
        />
        <InsightCard
          detail="Applications currently marked as offer"
          icon={Handshake}
          label="Offers"
          tone="green"
          value={insights.offers}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold tracking-[-0.03em]">
              Application progress
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your applications grouped by their current hiring status.
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
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your most recently updated applications.
              </p>
            </div>
            {insights.recentActivity.length ? (
              <div className="divide-y divide-border">
                {insights.recentActivity.map((application) => (
                  <Link
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    href="/dashboard/applications"
                    key={application.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{application.job_title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {application.organization_name} · Updated {formatDate(application.updated_at)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <CalendarDays className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-3 font-semibold">No application activity yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Apply to a live healthcare opportunity and your private
                  progress will appear here.
                </p>
                <Button asChild className="mt-5" variant="outline">
                  <Link href="/jobs">Find jobs</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfessionalDashboardShell>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
