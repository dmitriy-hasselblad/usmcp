"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requirePlatformAdmin } from "@/lib/admin/session"
import { formString, messagePath } from "@/lib/auth/validation"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function changeUserAccountStatus(formData: FormData) {
  const userId = formString(formData, "userId")
  const targetStatus = formString(formData, "targetStatus")
  const reason = formString(formData, "moderationReason")
  const confirmed = formData.get("confirmed") === "on"
  const returnPath = uuidPattern.test(userId) ? `/admin/users/${userId}` : "/admin/users"
  const identity = await requirePlatformAdmin(returnPath)
  if (!uuidPattern.test(userId) || !["active", "suspended"].includes(targetStatus) || !confirmed || reason.length > 1000 || (targetStatus === "suspended" && reason.length < 10)) {
    redirect(messagePath(returnPath, "error", "Confirm the decision and provide a valid moderation reason."))
  }
  const { error } = await identity.supabase.rpc("set_user_account_status", { target_user_id: userId, target_status: targetStatus, moderation_reason: reason || null })
  if (error) redirect(messagePath(returnPath, "error", "The account status could not be updated."))
  revalidatePath("/admin/users")
  revalidatePath(returnPath)
  redirect(messagePath(returnPath, "success", `Account status changed to ${targetStatus}.`))
}
