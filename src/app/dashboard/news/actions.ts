"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { newsImageMimeTypes, newsImageMaxBytes } from "@/lib/news/constants"

export async function createOrganizationPost(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/news/new")
  if (!canManageJobs(workspace.membership.role)) return { ok: false, message: "You do not have permission to create organization posts." }
  const title = formString(formData, "title")
  const excerpt = formString(formData, "excerpt")
  const body = formString(formData, "body")
  const coverImagePath = formString(formData, "coverImagePath")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const intent = formString(formData, "intent") === "publish" ? "publish" : "draft"
  if (title.length < 5 || title.length > 180 || excerpt.length < 20 || excerpt.length > 360 || body.length < 100 || body.length > 30000) {
    return { ok: false, message: "Review the title, summary, and article length." }
  }
  if (coverImagePath && (!coverImagePath.startsWith(`${workspace.organization.id}/`) || !newsImageMimeTypes.some(type => type === mimeType) || fileSize < 1 || fileSize > newsImageMaxBytes)) {
    return { ok: false, message: "The cover image is invalid." }
  }
  const { error } = await workspace.supabase.rpc("save_organization_post", {
    target_post_id: null,
    target_organization_id: workspace.organization.id,
    target_title: title,
    target_excerpt: excerpt,
    target_body: body,
    target_cover_image_path: coverImagePath || null,
    remove_cover_image: false,
    target_intent: intent,
  })
  if (error) return { ok: false, message: "The article could not be saved." }
  revalidateNewsPaths()
  return { ok: true, message: intent === "publish" ? "Article published." : "Draft saved." }
}

export async function updateOrganizationPost(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/news")
  if (!canManageJobs(workspace.membership.role)) return { ok: false, message: "You do not have permission to edit organization posts." }
  const postId = formString(formData, "postId")
  const title = formString(formData, "title"), excerpt = formString(formData, "excerpt"), body = formString(formData, "body")
  const coverImagePath = formString(formData, "coverImagePath")
  const removeCoverImage = formData.get("removeCoverImage") === "on" && !coverImagePath
  const mimeType = formString(formData, "mimeType"), fileSize = Number(formString(formData, "fileSize"))
  if (!/^[0-9a-f-]{36}$/i.test(postId) || title.length < 5 || title.length > 180 || excerpt.length < 20 || excerpt.length > 360 || body.length < 100 || body.length > 30000) return { ok: false, message: "Review the title, summary, and article length." }
  if (coverImagePath && (!coverImagePath.startsWith(`${workspace.organization.id}/`) || !newsImageMimeTypes.some(type => type === mimeType) || fileSize < 1 || fileSize > newsImageMaxBytes)) return { ok: false, message: "The cover image is invalid." }
  const intent = formString(formData, "intent") === "publish" ? "publish" : "draft"
  const { error } = await workspace.supabase.rpc("save_organization_post", {
    target_post_id: postId,
    target_organization_id: workspace.organization.id,
    target_title: title,
    target_excerpt: excerpt,
    target_body: body,
    target_cover_image_path: coverImagePath || null,
    remove_cover_image: removeCoverImage,
    target_intent: intent,
  })
  if (error) return { ok: false, message: "The article could not be updated." }
  revalidateNewsPaths()
  return { ok: true, message: intent === "publish" ? "Article published." : "Draft updated." }
}

export async function archiveOrganizationPost(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/news")
  const postId = formString(formData, "postId")
  if (!canManageJobs(workspace.membership.role) || !/^[0-9a-f-]{36}$/i.test(postId)) {
    redirect(messagePath("/dashboard/news", "error", "The article could not be removed."))
  }
  const { error } = await workspace.supabase.rpc("archive_organization_post", { target_post_id: postId })
  if (error) redirect(messagePath("/dashboard/news", "error", "The article could not be removed."))
  revalidateNewsPaths()
  redirect(messagePath("/dashboard/news", "success", "Article removed from public news."))
}

function revalidateNewsPaths() {
  revalidatePath("/dashboard/news")
  revalidatePath("/news")
  revalidatePath("/news/[slug]", "page")
}
