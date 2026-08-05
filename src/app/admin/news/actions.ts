"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requirePlatformAdmin } from "@/lib/admin/session"
import { formString, messagePath } from "@/lib/auth/validation"

export async function moderateOrganizationPost(formData: FormData) {
  const postId = formString(formData, "postId")
  const status = formString(formData, "status")
  const reason = formString(formData, "reason")
  const confirmed = formData.get("confirmed") === "on"
  const identity = await requirePlatformAdmin("/admin/news")
  if (!confirmed || !/^[0-9a-f-]{36}$/i.test(postId) || !["approved", "blocked"].includes(status) || (status === "blocked" && reason.length < 10)) redirect(messagePath("/admin/news", "error", "Confirm the decision and review the moderation reason."))
  const { error } = await identity.supabase.rpc("set_organization_post_moderation", { target_post_id: postId, target_status: status, moderation_reason: reason || null })
  if (error) redirect(messagePath("/admin/news", "error", "The article moderation status could not be changed."))
  revalidatePath("/admin/news"); revalidatePath("/news"); revalidatePath("/news/[slug]", "page")
  redirect(messagePath("/admin/news", "success", `Article ${status}.`))
}
