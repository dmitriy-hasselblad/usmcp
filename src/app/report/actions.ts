"use server"

import { redirect } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import { formString, isSafeInternalPath } from "@/lib/auth/validation"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const targetTypes = ["job", "organization", "organization_post"] as const
const categories = ["inaccurate", "inappropriate", "spam", "fraud", "other"] as const

export async function submitAbuseReport(formData: FormData) {
  const targetType = formString(formData, "targetType")
  const targetId = formString(formData, "targetId")
  const category = formString(formData, "category")
  const details = formString(formData, "details")
  const returnTo = formString(formData, "returnTo")
  const reportPath = buildReportPath(targetType, targetId, returnTo)
  const identity = await requireIdentity(reportPath)

  if (
    !targetTypes.includes(targetType as (typeof targetTypes)[number]) ||
    !uuidPattern.test(targetId) ||
    !categories.includes(category as (typeof categories)[number]) ||
    details.length < 20 || details.length > 2000
  ) {
    redirect(withMessage(reportPath, "error", "Review the report category and provide at least 20 characters."))
  }

  const { error } = await identity.supabase.from("abuse_reports").insert({
    reporter_id: identity.userId,
    target_type: targetType,
    target_id: targetId,
    category,
    details,
  })

  if (error) {
    redirect(withMessage(reportPath, "error", "This report could not be submitted. You may have already reported this content."))
  }

  redirect(withMessage(reportPath, "success", "Your report was submitted for platform review."))
}

function buildReportPath(targetType: string, targetId: string, returnTo: string) {
  const params = new URLSearchParams({ targetType, targetId })
  if (isSafeInternalPath(returnTo)) params.set("returnTo", returnTo)
  return `/report?${params.toString()}`
}

function withMessage(path: string, kind: "error" | "success", message: string) {
  const url = new URL(path, "https://ushce.invalid")
  url.searchParams.set(kind, message)
  return `${url.pathname}?${url.searchParams.toString()}`
}
