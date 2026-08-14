import type { ApplicationStatus } from "@/lib/applications/constants"

export type ProfessionalInsightApplication = {
  id: string
  job_title: string
  organization_name: string
  status: ApplicationStatus
  submitted_at: string
  updated_at: string
}

export function getApplicationInsights(
  applications: ProfessionalInsightApplication[],
) {
  const statusCounts = new Map<ApplicationStatus, number>([
    ["submitted", 0],
    ["reviewing", 0],
    ["interview", 0],
    ["offer", 0],
    ["rejected", 0],
    ["withdrawn", 0],
  ])

  for (const application of applications) {
    statusCounts.set(
      application.status,
      (statusCounts.get(application.status) ?? 0) + 1,
    )
  }

  const activeStatuses: ApplicationStatus[] = [
    "submitted",
    "reviewing",
    "interview",
  ]
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

  return {
    activeApplications: applications.filter((application) =>
      activeStatuses.includes(application.status),
    ).length,
    applicationsLast30Days: applications.filter(
      (application) => new Date(application.submitted_at).getTime() >= thirtyDaysAgo,
    ).length,
    interviews: statusCounts.get("interview") ?? 0,
    offers: statusCounts.get("offer") ?? 0,
    recentActivity: [...applications]
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() -
          new Date(left.updated_at).getTime(),
      )
      .slice(0, 5),
    statusCounts,
    totalApplications: applications.length,
  }
}
