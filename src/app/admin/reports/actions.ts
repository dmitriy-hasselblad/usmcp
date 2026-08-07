"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requirePlatformAdmin } from "@/lib/admin/session"
import { formString, messagePath } from "@/lib/auth/validation"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function reviewAbuseReport(formData: FormData) {
  const reportId = formString(formData, "reportId")
  const status = formString(formData, "status")
  const note = formString(formData, "note")
  const confirmed = formData.get("confirmed") === "on"
  const returnPath = "/admin/reports"
  const identity = await requirePlatformAdmin(returnPath)

  if (!uuidPattern.test(reportId) || !["resolved", "dismissed"].includes(status) || note.length < 2 || note.length > 1000 || !confirmed) {
    redirect(messagePath(returnPath, "error", "Confirm the decision and provide a resolution note."))
  }

  const { error } = await identity.supabase.rpc("set_abuse_report_status", {
    target_report_id: reportId,
    target_status: status,
    target_resolution_note: note,
  })
  if (error) redirect(messagePath(returnPath, "error", "The report could not be updated."))
  revalidatePath(returnPath)
  revalidatePath("/admin/audit")
  redirect(messagePath(returnPath, "success", `Report marked ${status}.`))
}
