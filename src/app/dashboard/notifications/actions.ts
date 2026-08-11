"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import { requireIdentity } from "@/lib/auth/session"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export async function markNotificationRead(formData: FormData) {
  const identity = await requireIdentity("/dashboard/notifications")
  const notificationId = formString(formData, "notificationId")

  if (!isUuid(notificationId)) {
    redirect(messagePath("/dashboard/notifications", "error", "Notification not found."))
  }

  const { error } = await identity.supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", identity.userId)

  if (error) {
    redirect(messagePath("/dashboard/notifications", "error", "Notification could not be updated."))
  }

  revalidatePath("/dashboard", "layout")
  redirect(messagePath("/dashboard/notifications", "success", "Notification marked as read."))
}

export async function markAllNotificationsRead() {
  const identity = await requireIdentity("/dashboard/notifications")

  const { error } = await identity.supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", identity.userId)
    .is("read_at", null)

  if (error) {
    redirect(messagePath("/dashboard/notifications", "error", "Notifications could not be updated."))
  }

  revalidatePath("/dashboard", "layout")
  redirect(messagePath("/dashboard/notifications", "success", "All notifications marked as read."))
}
