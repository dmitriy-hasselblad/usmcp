"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

import {
  formString,
  isValidEmail,
  isUsState,
  messagePath,
  organizationTypes,
} from "@/lib/auth/validation"
import {
  canManageJobs,
  canManageOrganization,
  isExperienceLevel,
  isEmploymentType,
  isJobPostingDuration,
  isJobStatus,
  isSalaryPeriod,
  isWorkplaceType,
  type JobStatus,
} from "@/lib/employer/constants"
import { isHealthcareProfession } from "@/lib/healthcare-taxonomy"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { sendMatchingJobAlertEmails } from "@/lib/jobs/job-alert-email"
import { organizationLogoMaxBytes, organizationLogoMimeTypes, organizationLogosBucket } from "@/lib/employer/organization-logo"

type UploadActionResult = { ok: boolean; message: string }
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

export async function registerOrganizationLogo(formData: FormData): Promise<UploadActionResult> {
  const workspace = await requireEmployerWorkspace("/dashboard/organization")
  if (!canManageOrganization(workspace.membership.role)) return { ok: false, message: "Only organization owners and admins can update the logo." }
  const storagePath = formString(formData, "storagePath")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const [organizationId, uploadId, fileName, ...extra] = storagePath.split("/")
  const expectedFileName = mimeType === "image/png" ? "logo.png" : mimeType === "image/webp" ? "logo.webp" : mimeType === "image/jpeg" ? "logo.jpg" : ""
  if (extra.length || organizationId !== workspace.organization.id || !uuidPattern.test(uploadId ?? "") || fileName !== expectedFileName || !organizationLogoMimeTypes.some((type) => type === mimeType) || !Number.isInteger(fileSize) || fileSize < 1 || fileSize > organizationLogoMaxBytes) return { ok: false, message: "The logo details are invalid." }
  const { data: objects, error: storageError } = await workspace.supabase.storage.from(organizationLogosBucket).list(`${organizationId}/${uploadId}`, { limit: 5, search: fileName })
  const object = objects?.find((item) => item.name === fileName)
  const metadata = object?.metadata as { mimetype?: string; size?: number } | null | undefined
  if (storageError || !object || metadata?.size !== fileSize || (metadata?.mimetype && metadata.mimetype !== mimeType)) return { ok: false, message: "We could not verify the uploaded logo." }
  const { data: current, error: currentError } = await workspace.supabase.from("organizations").select("logo_path").eq("id", workspace.organization.id).single()
  if (currentError) return { ok: false, message: "We could not load the current organization logo." }
  const { error } = await workspace.supabase.from("organizations").update({ logo_path: storagePath }).eq("id", workspace.organization.id)
  if (error) return { ok: false, message: "We could not activate this logo." }
  if (current.logo_path && current.logo_path !== storagePath) await workspace.supabase.storage.from(organizationLogosBucket).remove([current.logo_path])
  revalidatePath("/dashboard", "layout")
  revalidatePath("/organizations")
  return { ok: true, message: "Organization logo updated." }
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
  const publicEmail = formString(formData, "publicEmail")
  const publicPhone = formString(formData, "publicPhone")
  const addressLine1 = formString(formData, "addressLine1")
  const addressLine2 = formString(formData, "addressLine2")
  const city = formString(formData, "city")
  const postalCode = formString(formData, "postalCode")

  if (
    name.length < 2 ||
    name.length > 160 ||
    !organizationTypes.some((option) => option === organizationType) ||
    !isUsState(stateCode) ||
    !isValidWebsite(website) ||
    description.length > 2000 ||
    (publicEmail && !isValidEmail(publicEmail)) || publicPhone.length > 30 ||
    addressLine1.length > 160 || addressLine2.length > 160 || city.length > 120 || postalCode.length > 20
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
      public_email: publicEmail || null, public_phone: publicPhone || null,
      address_line1: addressLine1 || null, address_line2: addressLine2 || null,
      city: city || null, postal_code: postalCode || null,
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
  const profession = formString(formData, "profession")
  const specialty = formString(formData, "specialty")
  const experienceLevel = formString(formData, "experienceLevel")
  const city = formString(formData, "city")
  const stateCode = formString(formData, "stateCode")
  const employmentType = formString(formData, "employmentType")
  const workplaceType = formString(formData, "workplaceType")
  const salaryPeriod = formString(formData, "salaryPeriod")
  const salaryMin = optionalSalary(formData, "salaryMin")
  const salaryMax = optionalSalary(formData, "salaryMax")
  const description = formString(formData, "description")
  const postingDurationDays = Number(
    formString(formData, "postingDurationDays"),
  )
  const openPositions = Number(formString(formData, "openPositions"))
  const requiredSkills = [...new Set(formString(formData, "requiredSkills").split(",").map((skill) => skill.trim()).filter((skill) => skill.length >= 2 && skill.length <= 80))].slice(0, 20)
  const visaSupport = formData.get("visaSupport") === "on"

  const salaryIsInvalid =
    Number.isNaN(salaryMin) ||
    Number.isNaN(salaryMax) ||
    (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)

  if (
    title.length < 3 ||
    title.length > 160 ||
    !isHealthcareProfession(profession) ||
    specialty.length > 120 ||
    !isExperienceLevel(experienceLevel) ||
    city.length < 2 ||
    city.length > 120 ||
    !isUsState(stateCode) ||
    !isEmploymentType(employmentType) ||
    !isWorkplaceType(workplaceType) ||
    !isSalaryPeriod(salaryPeriod) ||
    !isJobPostingDuration(postingDurationDays) ||
    !Number.isSafeInteger(openPositions) ||
    openPositions < 1 ||
    openPositions > 250 ||
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
    profession,
    specialty: specialty || null,
    experience_level: experienceLevel,
    city,
    state_code: stateCode,
    employment_type: employmentType,
    workplace_type: workplaceType,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_period: salaryPeriod,
    visa_support: visaSupport,
    description: description || null,
    required_skills: requiredSkills,
    posting_duration_days: postingDurationDays,
    open_positions: openPositions,
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
    .select("status, slug, title, profession, specialty, state_code, city, employment_type, workplace_type, experience_level, visa_support, description, posting_duration_days, expires_at, open_positions")
    .eq("id", jobId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  const currentStatus = existingJob?.status as JobStatus | undefined
  if (
    !existingJob ||
    !currentStatus ||
    !allowedJobTransitions[currentStatus]?.includes(status) ||
    (status === "published" && existingJob.open_positions < 1)
  ) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        status === "published" && existingJob?.open_positions < 1
          ? "Add at least one open position before publishing this job."
          : "This job status change is not available.",
      ),
    )
  }

  if (status === "draft") {
    const { count } = await workspace.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId)

    if ((count ?? 0) > 0) {
      redirect(messagePath("/dashboard/jobs", "error", "Jobs with application history remain closed. Create a new job for a future opening."))
    }
  }

  const { data: updatedJob, error } = await workspace.supabase
    .from("jobs")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", jobId)
    .eq("organization_id", workspace.organization.id)
    .select("id, published_at")
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

  if (status === "published" && updatedJob.published_at) {
    after(async () => {
      await sendMatchingJobAlertEmails({
        id: updatedJob.id,
        slug: existingJob.slug,
        title: existingJob.title,
        profession: existingJob.profession,
        specialty: existingJob.specialty,
        stateCode: existingJob.state_code,
        city: existingJob.city,
        employmentType: existingJob.employment_type,
        workplaceType: existingJob.workplace_type,
        experienceLevel: existingJob.experience_level,
        visaSupport: existingJob.visa_support,
        description: existingJob.description,
        organizationName: workspace.organization.name,
        publishedAt: updatedJob.published_at,
      })
    })
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

export async function permanentlyDeleteJob(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/jobs")

  if (!canManageJobs(workspace.membership.role)) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "Your workspace role cannot delete jobs.",
      ),
    )
  }

  const jobId = formString(formData, "jobId")
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      jobId,
    )
  ) {
    redirect(messagePath("/dashboard/jobs", "error", "The job deletion is invalid."))
  }

  const { data: job } = await workspace.supabase
    .from("jobs")
    .select("id, slug")
    .eq("id", jobId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  if (!job) {
    redirect(messagePath("/dashboard/jobs", "error", "This job is unavailable."))
  }

  const { count: applicationCount, error: applicationsError } =
    await workspace.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id)

  if (applicationsError) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "We could not confirm whether this job has applications.",
      ),
    )
  }

  if ((applicationCount ?? 0) > 0) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "This job has applications and cannot be permanently deleted. Close it to protect candidate records.",
      ),
    )
  }

  const { data: deletedJob, error } = await workspace.supabase
    .from("jobs")
    .delete()
    .eq("id", job.id)
    .eq("organization_id", workspace.organization.id)
    .select("id")
    .maybeSingle()

  if (error || !deletedJob) {
    redirect(
      messagePath(
        "/dashboard/jobs",
        "error",
        "We could not permanently delete the job.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  revalidatePath("/")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${job.slug}`)
  redirect(messagePath("/dashboard/jobs", "success", "Job permanently deleted."))
}
