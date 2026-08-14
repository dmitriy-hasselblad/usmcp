import type { ApplicationStatus } from "@/lib/applications/constants"

export type HiringInsightApplication = {
  id: string
  candidate_id: string
  job_id: string
  job_title: string
  status: ApplicationStatus
  submitted_at: string
}

export type HiringInsightJob = {
  id: string
  title: string
  status: string
}

export function getHiringInsights(
  applications: HiringInsightApplication[],
  jobs: HiringInsightJob[],
) {
  const activeStatuses: ApplicationStatus[] = [
    "submitted",
    "reviewing",
    "interview",
  ]
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

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const applicationsLast30Days = applications.filter(
    (application) => new Date(application.submitted_at).getTime() >= thirtyDaysAgo,
  ).length
  const activeCandidates = new Set(
    applications
      .filter((application) => activeStatuses.includes(application.status))
      .map((application) => application.candidate_id),
  ).size

  const jobsById = new Map(jobs.map((job) => [job.id, job]))
  const jobRows = [...new Map(applications.map((application) => [
    application.job_id,
    {
      id: application.job_id,
      title: jobsById.get(application.job_id)?.title ?? application.job_title,
      applications: 0,
      active: 0,
      interviews: 0,
      offers: 0,
    },
  ])).values()]
  const jobRowsById = new Map(jobRows.map((job) => [job.id, job]))

  for (const application of applications) {
    const job = jobRowsById.get(application.job_id)
    if (!job) continue
    job.applications += 1
    if (activeStatuses.includes(application.status)) job.active += 1
    if (application.status === "interview") job.interviews += 1
    if (application.status === "offer") job.offers += 1
  }

  return {
    applicationsLast30Days,
    activeCandidates,
    activeJobs: jobs.filter((job) => job.status === "published").length,
    offers: statusCounts.get("offer") ?? 0,
    statusCounts,
    jobRows: jobRows.sort((left, right) => right.applications - left.applications),
    totalApplications: applications.length,
  }
}
