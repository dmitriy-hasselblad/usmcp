"use server"

import { revalidatePath } from "next/cache"

import { formString } from "@/lib/auth/validation"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { newsImageMimeTypes, newsImageMaxBytes } from "@/lib/news/constants"

function slugFor(title: string) {
  const base = title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 130) || "update"
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

export async function createOrganizationPost(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/news/new")
  if (!canManageJobs(workspace.membership.role)) return { ok: false, message: "You do not have permission to create organization posts." }
  const title = formString(formData, "title")
  const excerpt = formString(formData, "excerpt")
  const body = formString(formData, "body")
  const coverImagePath = formString(formData, "coverImagePath")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const intent = formString(formData, "intent")
  if (title.length < 5 || title.length > 180 || excerpt.length < 20 || excerpt.length > 360 || body.length < 100 || body.length > 30000) {
    return { ok: false, message: "Review the title, summary, and article length." }
  }
  if (coverImagePath && (!coverImagePath.startsWith(`${workspace.organization.id}/`) || !newsImageMimeTypes.some(type => type === mimeType) || fileSize < 1 || fileSize > newsImageMaxBytes)) {
    return { ok: false, message: "The cover image is invalid." }
  }
  const status = intent === "submit" ? "submitted" : "draft"
  const { error } = await workspace.supabase.from("organization_posts").insert({
    organization_id: workspace.organization.id,
    author_id: workspace.userId,
    slug: slugFor(title), title, excerpt, body,
    cover_image_path: coverImagePath || null,
    status,
  })
  if (error) return { ok: false, message: "The article could not be saved." }
  revalidatePath("/dashboard/news")
  return { ok: true, message: status === "submitted" ? "Article submitted for review." : "Draft saved." }
}

export async function updateOrganizationPost(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/news")
  if (!canManageJobs(workspace.membership.role)) return { ok: false, message: "You do not have permission to edit organization posts." }
  const postId = formString(formData, "postId")
  const title = formString(formData, "title"), excerpt = formString(formData, "excerpt"), body = formString(formData, "body")
  const coverImagePath = formString(formData, "coverImagePath")
  const mimeType = formString(formData, "mimeType"), fileSize = Number(formString(formData, "fileSize"))
  if (!/^[0-9a-f-]{36}$/i.test(postId) || title.length < 5 || title.length > 180 || excerpt.length < 20 || excerpt.length > 360 || body.length < 100 || body.length > 30000) return { ok: false, message: "Review the title, summary, and article length." }
  if (coverImagePath && (!coverImagePath.startsWith(`${workspace.organization.id}/`) || !newsImageMimeTypes.some(type => type === mimeType) || fileSize < 1 || fileSize > newsImageMaxBytes)) return { ok: false, message: "The cover image is invalid." }
  const updates: Record<string, string | null> = { title, excerpt, body, status: formString(formData, "intent") === "submit" ? "submitted" : "draft", published_at: null }
  if (coverImagePath) updates.cover_image_path = coverImagePath
  const { error } = await workspace.supabase.from("organization_posts").update(updates).eq("id", postId).eq("organization_id", workspace.organization.id)
  if (error) return { ok: false, message: "The article could not be updated." }
  revalidatePath("/dashboard/news")
  return { ok: true, message: updates.status === "submitted" ? "Article submitted for review." : "Draft updated." }
}
