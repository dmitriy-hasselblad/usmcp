"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { formString, messagePath } from "@/lib/auth/validation"
import {
  isEmployerApplicationStatus,
  withdrawableApplicationStatuses,
  type ApplicationStatus,
} from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { sendApplicationStatusEmail, sendNewEmployerMessageEmail } from "@/lib/email/application-status"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export async function submitApplication(formData: FormData) {
  const jobSlug = formString(formData, "jobSlug")
  const nextPath = jobSlug ? `/jobs/${jobSlug}/apply` : "/jobs"
  const identity = await requireIdentity(nextPath)
  const jobId = formString(formData, "jobId")
  const phone = formString(formData, "phone")
  const resumeDocumentId = formString(formData, "resumeDocumentId")
  const coverLetter = formString(formData, "coverLetter")

  if (
    !isUuid(jobId) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(jobSlug) ||
    phone.length < 7 ||
    phone.length > 30 ||
    (resumeDocumentId.length > 0 && !isUuid(resumeDocumentId)) ||
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
      resume_document_id: resumeDocumentId || null,
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
    .select("id, candidate_email, candidate_first_name, job_title, organization_name, status, updated_at")
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

  after(async () => {
    const delivery = await sendApplicationStatusEmail({
      applicationId: data.id,
      candidateEmail: data.candidate_email,
      candidateFirstName: data.candidate_first_name,
      jobTitle: data.job_title,
      organizationName: data.organization_name,
      status: data.status,
      updatedAt: data.updated_at,
    })
    if (delivery.outcome === "failed") {
      console.error("Application status email delivery failed", {
        applicationId: data.id,
        code: delivery.code,
        status: data.status,
      })
    }
  })

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

export async function sendApplicationMessage(formData: FormData) {
  const identity = await requireIdentity("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")
  const body = formString(formData, "body")
  const returnPath = isUuid(applicationId)
    ? `/dashboard/applications/${applicationId}`
    : "/dashboard/applications"

  if (!isUuid(applicationId) || body.length < 1 || body.length > 4000) {
    redirect(messagePath(returnPath, "error", "Write a message between 1 and 4,000 characters."))
  }

  const { data: application } = await identity.supabase
    .from("applications")
    .select("id, organization_id, candidate_id, status, candidate_email, candidate_first_name, organization_name")
    .eq("id", applicationId)
    .maybeSingle()

  if (!application || application.status === "withdrawn") {
    redirect(messagePath(returnPath, "error", "This application is not available for messaging."))
  }

  const { error } = await identity.supabase.from("application_messages").insert({
    application_id: application.id,
    organization_id: application.organization_id,
    candidate_id: application.candidate_id,
    sender_user_id: identity.userId,
    body,
  })

  if (error) {
    redirect(messagePath(returnPath, "error", "Your message could not be sent."))
  }

  if (identity.userId !== application.candidate_id) {
    after(async () => {
      const delivery = await sendNewEmployerMessageEmail({
        applicationId: application.id,
        candidateEmail: application.candidate_email,
        candidateFirstName: application.candidate_first_name,
        organizationName: application.organization_name,
      })
      if (delivery.outcome === "failed") {
        console.error("New employer message email delivery failed", { applicationId: application.id, code: delivery.code })
      }
    })
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/applications/${applicationId}`)
  redirect(messagePath(returnPath, "success", "Message sent."))
}
