"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import {
  isEmployerApplicationStatus,
  withdrawableApplicationStatuses,
  type ApplicationStatus,
} from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { requireEmployerWorkspace } from "@/lib/employer/session"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function isValidOptionalUrl(value: string) {
  if (!value) return true
  if (value.length > 500) return false

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export async function submitApplication(formData: FormData) {
  const jobSlug = formString(formData, "jobSlug")
  const nextPath = jobSlug ? `/jobs/${jobSlug}/apply` : "/jobs"
  const identity = await requireIdentity(nextPath)
  const jobId = formString(formData, "jobId")
  const phone = formString(formData, "phone")
  const resumeUrl = formString(formData, "resumeUrl")
  const coverLetter = formString(formData, "coverLetter")

  if (
    !isUuid(jobId) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(jobSlug) ||
    phone.length < 7 ||
    phone.length > 30 ||
    !isValidOptionalUrl(resumeUrl) ||
    coverLetter.length < 30 ||
    coverLetter.length > 5000
  ) {
    redirect(
      messagePath(
        nextPath,
        "error",
        "Review your contact details and application message.",
      ),
    )
  }

  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type !== "professional") {
    redirect(
      messagePath(
        nextPath,
        "error",
        "A healthcare professional account is required to apply.",
      ),
    )
  }

  const { data: application, error } = await identity.supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: identity.userId,
      phone,
      resume_url: resumeUrl || null,
      cover_letter: coverLetter,
    })
    .select("id")
    .maybeSingle()

  if (error?.code === "23505") {
    redirect(
      messagePath(
        nextPath,
        "error",
        "You have already applied for this opportunity.",
      ),
    )
  }

  if (error || !application) {
    redirect(
      messagePath(
        nextPath,
        "error",
        "We could not submit your application. Please try again.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/applications")
  revalidatePath(`/jobs/${jobSlug}`)
  redirect(
    messagePath(
      "/dashboard/applications",
      "success",
      "Application submitted successfully.",
    ),
  )
}

export async function withdrawApplication(formData: FormData) {
  const identity = await requireIdentity("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")

  if (!isUuid(applicationId)) {
    redirect(
      messagePath(
        "/dashboard/applications",
        "error",
        "The application update is invalid.",
      ),
    )
  }

  const { data: current } = await identity.supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .eq("candidate_id", identity.userId)
    .maybeSingle()

  const currentStatus = current?.status as ApplicationStatus | undefined
  if (
    !currentStatus ||
    !withdrawableApplicationStatuses.includes(currentStatus)
  ) {
    redirect(
      messagePath(
        "/dashboard/applications",
        "error",
        "This application can no longer be withdrawn.",
      ),
    )
  }

  const { data, error } = await identity.supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .eq("candidate_id", identity.userId)
    .select("id")
    .maybeSingle()

  if (error || !data) {
    redirect(
      messagePath(
        "/dashboard/applications",
        "error",
        "We could not withdraw this application.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/applications")
  revalidatePath(`/dashboard/applications/${applicationId}`)
  redirect(
    messagePath(
      "/dashboard/applications",
      "success",
      "Application withdrawn.",
    ),
  )
}

export async function updateApplicationStatus(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")
  const status = formString(formData, "status")

  if (!isUuid(applicationId) || !isEmployerApplicationStatus(status)) {
    redirect(
      messagePath(
        "/dashboard/applications",
        "error",
        "The application update is invalid.",
      ),
    )
  }

  const { data, error } = await workspace.supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .select("id")
    .maybeSingle()

  if (error || !data) {
    redirect(
      messagePath(
        `/dashboard/applications/${applicationId}`,
        "error",
        "We could not update the application status.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/applications")
  revalidatePath(`/dashboard/applications/${applicationId}`)
  redirect(
    messagePath(
      `/dashboard/applications/${applicationId}`,
      "success",
      "Application status updated.",
    ),
  )
}
