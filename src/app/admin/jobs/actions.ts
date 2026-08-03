"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requirePlatformAdmin } from "@/lib/admin/session"
import { formString, messagePath } from "@/lib/auth/validation"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const allowedStatuses = ["approved", "under_review", "blocked"] as const

export async function changeJobModeration(formData: FormData) {
  const jobId = formString(formData, "jobId")
  const targetStatus = formString(formData, "targetStatus")
  const moderationReason = formString(formData, "moderationReason")
  const confirmed = formData.get("confirmed") === "on"
  const returnPath = uuidPattern.test(jobId) ? `/admin/jobs/${jobId}` : "/admin/jobs"
  const identity = await requirePlatformAdmin(returnPath)

  if (!uuidPattern.test(jobId) || !allowedStatuses.some((status) => status === targetStatus) || !confirmed || moderationReason.length > 1000 || (targetStatus === "blocked" && moderationReason.length < 10)) {
    redirect(messagePath(returnPath, "error", "Confirm the decision and review the moderation note."))
  }

  const { error } = await identity.supabase.rpc("set_job_moderation", {
    target_job_id: jobId,
    target_status: targetStatus,
    moderation_reason: moderationReason || null,
  })

  if (error) redirect(messagePath(returnPath, "error", "The moderation status could not be updated."))

  revalidatePath("/admin")
  revalidatePath("/admin/jobs")
  revalidatePath(returnPath)
  revalidatePath("/jobs")
  revalidatePath("/jobs/[slug]", "page")
  redirect(messagePath(returnPath, "success", `Job moderation changed to ${targetStatus}.`))
}
