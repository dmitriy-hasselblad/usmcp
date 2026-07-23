"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  formString,
  isUsState,
  messagePath,
  organizationTypes,
} from "@/lib/auth/validation"
import {
  canManageJobs,
  canManageOrganization,
  isEmploymentType,
  isJobStatus,
  isSalaryPeriod,
  isWorkplaceType,
  type JobStatus,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

function optionalSalary(formData: FormData, name: string) {
  const value = formString(formData, name)
  if (!value) return null
  if (!/^\d+$/.test(value)) return Number.NaN

  const amount = Number(value)
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : Number.NaN
}

function isValidWebsite(value: string) {
  if (!value) return true

  try {
    const url = new URL(value)
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      value.length <= 300
    )
  } catch {
    return false
  }
}

function createJobSlug(title: string) {
  const base =
    title
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 140) || "healthcare-job"

  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

const allowedJobTransitions: Record<JobStatus, JobStatus[]> = {
  draft: ["published"],
  published: ["paused", "closed"],
  paused: ["published", "closed"],
  closed: ["draft"],
}

export async function updateOrganization(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/organization")

  if (!canManageOrganization(workspace.membership.role)) {
    redirect(
      messagePath(
        "/dashboard/organization",
        "error",
        "Only organization owners and admins can edit this profile.",
      ),
    )
  }

  const name = formString(formData, "name")
  const organizationType = formString(formData, "organizationType")
  const stateCode = formString(formData, "stateCode")
  const website = formString(formData, "website")
  const description = formString(formData, "description")

  if (
    name.length < 2 ||
    name.length > 160 ||
    !organizationTypes.some((option) => option === organizationType) ||
    !isUsState(stateCode) ||
    !isValidWebsite(website) ||
    description.length > 2000
  ) {
    redirect(
      messagePath(
        "/dashboard/organization",
        "error",
        "Review the organization details and try again.",
      ),
    )
  }

  const { error } = await workspace.supabase
    .from("organizations")
    .update({
      name,
      organization_type: organizationType,
      state_code: stateCode,
      website: website || null,
      description: description || null,
    })
    .eq("id", workspace.organization.id)

  if (error) {
    redirect(
      messagePath(
        "/dashboard/organization",
        "error",
        "We could not update the organization profile.",
      ),
    )
  }

  revalidatePath("/dashboard", "layout")
  redirect(
    messagePath(
      "/dashboard/organization",
      "success",
      "Organization profile updated.",
    ),
  )
}

export async function createJobDraft(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/jobs/new")

  if (!canManageJobs(workspace.membership.role)) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "Your workspace role cannot create jobs.",
      ),
    )
  }

  const title = formString(formData, "title")
  const specialty = formString(formData, "specialty")
  const city = formString(formData, "city")
  const stateCode = formString(formData, "stateCode")
  const employmentType = formString(formData, "employmentType")
  const workplaceType = formString(formData, "workplaceType")
  const salaryPeriod = formString(formData, "salaryPeriod")
  const salaryMin = optionalSalary(formData, "salaryMin")
  const salaryMax = optionalSalary(formData, "salaryMax")
  const description = formString(formData, "description")
  const visaSupport = formData.get("visaSupport") === "on"

  const salaryIsInvalid =
    Number.isNaN(salaryMin) ||
    Number.isNaN(salaryMax) ||
    (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)

  if (
    title.length < 3 ||
    title.length > 160 ||
    specialty.length > 120 ||
    city.length < 2 ||
    city.length > 120 ||
    !isUsState(stateCode) ||
    !isEmploymentType(employmentType) ||
    !isWorkplaceType(workplaceType) ||
    !isSalaryPeriod(salaryPeriod) ||
    salaryIsInvalid ||
    description.length > 10000
  ) {
    redirect(
      messagePath(
        "/dashboard/jobs/new",
        "error",
        "Review the job details and try again.",
      ),
    )
  }

  const { error } = await workspace.supabase.from("jobs").insert({
    organization_id: workspace.organization.id,
    created_by: workspace.userId,
    slug: createJobSlug(title),
    title,
    specialty: specialty || null,
    city,
    state_code: stateCode,
    employment_type: employmentType,
    workplace_type: workplaceType,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_period: salaryPeriod,
    visa_support: visaSupport,
    description: description || null,
    status: "draft",
    published_at: null,
  })

  if (error) {
    redirect(
      messagePath(
        "/dashboard/jobs/new",
        "error",
        "We could not save this job draft.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  redirect(
    messagePath(
      "/dashboard/jobs",
      "success",
      "Job draft created. Review it before publishing.",
    ),
  )
}

export async function changeJobStatus(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/jobs")

  if (!canManageJobs(workspace.membership.role)) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "Your workspace role cannot manage jobs.",
      ),
    )
  }

  const jobId = formString(formData, "jobId")
  const status = formString(formData, "status")

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      jobId,
    ) ||
    !isJobStatus(status)
  ) {
    redirect(
      messagePath("/dashboard/jobs", "error", "The job update is invalid."),
    )
  }

  const { data: existingJob } = await workspace.supabase
    .from("jobs")
    .select("status, slug")
    .eq("id", jobId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  const currentStatus = existingJob?.status as JobStatus | undefined
  if (
    !existingJob ||
    !currentStatus ||
    !allowedJobTransitions[currentStatus]?.includes(status)
  ) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "This job status change is not available.",
      ),
    )
  }

  const { data: updatedJob, error } = await workspace.supabase
    .from("jobs")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", jobId)
    .eq("organization_id", workspace.organization.id)
    .select("id")
    .maybeSingle()

  if (error || !updatedJob) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "We could not update the job status.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  revalidatePath("/")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${existingJob.slug}`)
  redirect(
    messagePath(
      "/dashboard/jobs",
      "success",
      `Job moved to ${status}.`,
    ),
  )
}
