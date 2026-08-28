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
import { sendApplicationStatusEmail, sendHiringNotificationEmail, sendNewEmployerMessageEmail } from "@/lib/email/application-status"
import { notifyHiringTeamOfNewApplication } from "@/lib/applications/new-application-email"
import { applicationMessageAttachmentMaxBytes, isApplicationMessageAttachmentMimeType } from "@/lib/applications/message-attachments"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

type ApplicationDocumentChoice = {
  id: string
  source: "uploaded" | "builder"
}

function applicationDocumentChoice(value: string) {
  if (!value) return null
  const [source, id, extra] = value.split(":")
  if (
    extra ||
    (source !== "uploaded" && source !== "builder") ||
    !id ||
    !isUuid(id)
  ) {
    return undefined
  }
  return { source, id } as ApplicationDocumentChoice
}

export async function submitApplication(formData: FormData) {
  const jobSlug = formString(formData, "jobSlug")
  const nextPath = jobSlug ? `/jobs/${jobSlug}/apply` : "/jobs"
  const identity = await requireIdentity(nextPath)
  const jobId = formString(formData, "jobId")
  const phone = formString(formData, "phone")
  const resumeChoice = applicationDocumentChoice(
    formString(formData, "resumeChoice"),
  )
  const coverLetterChoice = applicationDocumentChoice(
    formString(formData, "coverLetterChoice"),
  )
  const coverLetter = formString(formData, "coverLetter")

  if (
    !isUuid(jobId) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(jobSlug) ||
    phone.length < 7 ||
    phone.length > 30 ||
    resumeChoice === undefined ||
    coverLetterChoice === undefined ||
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
      resume_document_id:
        resumeChoice?.source === "uploaded" ? resumeChoice.id : null,
      resume_builder_id:
        resumeChoice?.source === "builder" ? resumeChoice.id : null,
      cover_letter_document_id:
        coverLetterChoice?.source === "uploaded" ? coverLetterChoice.id : null,
      cover_letter_builder_id:
        coverLetterChoice?.source === "builder" ? coverLetterChoice.id : null,
      cover_letter: coverLetter,
    })
    .select("id, organization_id, candidate_first_name, candidate_last_name, job_title, organization_name")
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

  after(async () => {
    const delivery = await notifyHiringTeamOfNewApplication({
      applicationId: application.id,
      organizationId: application.organization_id,
      candidateFirstName: application.candidate_first_name,
      candidateLastName: application.candidate_last_name,
      jobTitle: application.job_title,
      organizationName: application.organization_name,
    })
    if (delivery.outcome === "failed") {
      console.error("New application email delivery failed", {
        applicationId: application.id,
        code: delivery.code,
      })
    }
  })

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

export async function markApplicationHired(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")
  const returnPath = isUuid(applicationId)
    ? `/dashboard/applications/${applicationId}`
    : "/dashboard/applications"

  if (!isUuid(applicationId)) {
    redirect(messagePath(returnPath, "error", "The hiring decision is invalid."))
  }

  const { data, error } = await workspace.supabase.rpc("mark_application_hired", {
    target_application_id: applicationId,
  })
  const result = data?.[0] as
    | {
        application_id: string
        candidate_email: string
        candidate_first_name: string
        candidate_last_name?: string
        job_title: string
        organization_name: string
        updated_at: string
        remaining_open_positions: number
        job_closed: boolean
      }
    | undefined

  if (error || !result) {
    redirect(messagePath(returnPath, "error", "We could not record this hiring decision. The opening may already be filled."))
  }

  after(async () => {
    const [candidateDelivery, adminDelivery] = await Promise.all([
      sendApplicationStatusEmail({
        applicationId: result.application_id,
        candidateEmail: result.candidate_email,
        candidateFirstName: result.candidate_first_name,
        jobTitle: result.job_title,
        organizationName: result.organization_name,
        status: "hired",
        updatedAt: result.updated_at,
      }),
      sendHiringNotificationEmail({
        applicationId: result.application_id,
        candidateFirstName: result.candidate_first_name,
        candidateLastName: result.candidate_last_name ?? "",
        jobTitle: result.job_title,
        organizationName: result.organization_name,
        remainingOpenPositions: result.remaining_open_positions,
      }),
    ])

    if (candidateDelivery.outcome === "failed" || adminDelivery.outcome === "failed") {
      console.error("Hiring notification email delivery failed", {
        applicationId: result.application_id,
        candidateOutcome: candidateDelivery.outcome,
        adminOutcome: adminDelivery.outcome,
      })
    }
  })

  revalidatePath("/")
  revalidatePath("/jobs")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  revalidatePath("/dashboard/applications")
  revalidatePath(returnPath)
  redirect(
    messagePath(
      returnPath,
      "success",
      result.job_closed
        ? "Candidate marked as hired. All positions are filled, so this job is now closed."
        : `Candidate marked as hired. ${result.remaining_open_positions} open positions remain.`,
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

function zonedDateTimeToIso(value: string, timeZone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const [, year, month, day, hour, minute] = match
  const asUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(asUtc))
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value)
    const timeZoneOffset = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute")) - asUtc
    return new Date(asUtc - timeZoneOffset).toISOString()
  } catch {
    return null
  }
}

export async function scheduleApplicationInterview(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")
  const startsAt = formString(formData, "startsAt")
  const timeZone = formString(formData, "timeZone")
  const durationMinutes = Number(formString(formData, "durationMinutes"))
  const interviewFormat = formString(formData, "interviewFormat")
  const locationOrLink = formString(formData, "locationOrLink")
  const notes = formString(formData, "notes")
  const returnPath = isUuid(applicationId) ? `/dashboard/applications/${applicationId}` : "/dashboard/applications"

  const startsAtIso = zonedDateTimeToIso(startsAt, timeZone)
  if (!isUuid(applicationId) || !startsAtIso || !Number.isSafeInteger(durationMinutes)) {
    redirect(messagePath(returnPath, "error", "The interview details are invalid."))
  }

  const { error } = await workspace.supabase.rpc("schedule_application_interview", {
    target_application_id: applicationId,
    target_starts_at: startsAtIso,
    target_time_zone: timeZone,
    target_duration_minutes: durationMinutes,
    target_interview_format: interviewFormat,
    target_location_or_link: locationOrLink || null,
    target_notes: notes || null,
  })

  if (error) {
    redirect(messagePath(returnPath, "error", "The interview invitation could not be sent."))
  }

  revalidatePath("/dashboard")
  revalidatePath(returnPath)
  redirect(messagePath(returnPath, "success", "Interview invitation sent."))
}

export async function respondToApplicationInterview(formData: FormData) {
  const identity = await requireIdentity("/dashboard/applications")
  const interviewId = formString(formData, "interviewId")
  const applicationId = formString(formData, "applicationId")
  const status = formString(formData, "status")
  const returnPath = isUuid(applicationId) ? `/dashboard/applications/${applicationId}` : "/dashboard/applications"

  if (!isUuid(interviewId) || !isUuid(applicationId) || !["confirmed", "declined"].includes(status)) {
    redirect(messagePath(returnPath, "error", "The interview response is invalid."))
  }

  const { error } = await identity.supabase.rpc("respond_to_application_interview", {
    target_interview_id: interviewId,
    target_status: status,
  })

  if (error) {
    redirect(messagePath(returnPath, "error", "The interview response could not be saved."))
  }

  revalidatePath("/dashboard")
  revalidatePath(returnPath)
  redirect(messagePath(returnPath, "success", status === "confirmed" ? "Interview confirmed." : "Interview declined."))
}

export async function cancelApplicationInterview(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/applications")
  const interviewId = formString(formData, "interviewId")
  const applicationId = formString(formData, "applicationId")
  const returnPath = isUuid(applicationId) ? `/dashboard/applications/${applicationId}` : "/dashboard/applications"

  if (!isUuid(interviewId) || !isUuid(applicationId)) {
    redirect(messagePath(returnPath, "error", "The interview cancellation is invalid."))
  }

  const { error } = await workspace.supabase.rpc("cancel_application_interview", { target_interview_id: interviewId })
  if (error) {
    redirect(messagePath(returnPath, "error", "The interview could not be cancelled."))
  }

  revalidatePath("/dashboard")
  revalidatePath(returnPath)
  redirect(messagePath(returnPath, "success", "Interview cancelled."))
}

export async function registerApplicationMessageAttachment(formData: FormData) {
  const identity = await requireIdentity("/dashboard/applications")
  const applicationId = formString(formData, "applicationId")
  const attachmentId = formString(formData, "attachmentId")
  const storagePath = formString(formData, "storagePath")
  const fileName = formString(formData, "fileName")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const returnPath = isUuid(applicationId) ? `/dashboard/applications/${applicationId}` : "/dashboard/applications"

  if (
    !isUuid(applicationId) ||
    !isUuid(attachmentId) ||
    !isApplicationMessageAttachmentMimeType(mimeType) ||
    !Number.isSafeInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > applicationMessageAttachmentMaxBytes ||
    fileName.length < 1 ||
    fileName.length > 180 ||
    storagePath !== `${applicationId}/${identity.userId}/${attachmentId}/${fileName}`
  ) {
    return { ok: false, message: "The attachment details are invalid." }
  }

  const { data: application } = await identity.supabase
    .from("applications")
    .select("organization_id, candidate_id, status")
    .eq("id", applicationId)
    .maybeSingle()

  if (!application || application.status === "withdrawn") {
    return { ok: false, message: "This application is not available for attachments." }
  }

  const { error } = await identity.supabase.from("application_message_attachments").insert({
    application_id: applicationId,
    organization_id: application.organization_id,
    candidate_id: application.candidate_id,
    uploaded_by: identity.userId,
    storage_path: storagePath,
    file_name: fileName,
    mime_type: mimeType,
    file_size: fileSize,
  })

  if (error) {
    return { ok: false, message: "The attachment could not be saved." }
  }

  revalidatePath("/dashboard")
  revalidatePath(returnPath)
  return { ok: true, message: "Attachment added." }
}
