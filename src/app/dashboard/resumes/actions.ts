"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import { defaultCvTemplateKey, emptyResumeContent, parseCvTemplateKey, parseResumeContent } from "@/lib/resume/types"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function requireProfessional(nextPath: string) {
  const identity = await requireIdentity(nextPath)
  const { data: account } = await identity.supabase.from("profiles").select("account_type, onboarding_completed").eq("id", identity.userId).single()
  if (account?.account_type !== "professional" || !account.onboarding_completed) redirect("/onboarding")
  return identity
}

export async function createResume() {
  const identity = await requireProfessional("/dashboard/resumes")
  const { count } = await identity.supabase.from("professional_resumes").select("id", { count: "exact", head: true }).eq("user_id", identity.userId)
  if ((count ?? 0) >= 10) redirect("/dashboard/resumes?error=You+can+keep+up+to+10+CVs.")
  const { data, error } = await identity.supabase.from("professional_resumes").insert({ user_id: identity.userId, title: "Healthcare CV", template_key: defaultCvTemplateKey, content: emptyResumeContent }).select("id").single()
  if (error || !data) redirect("/dashboard/resumes?error=The+CV+could+not+be+created.")
  redirect(`/dashboard/resumes/${data.id}`)
}

export async function saveResume(formData: FormData) {
  const id = String(formData.get("resumeId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const rawContent = String(formData.get("content") ?? "")
  const templateKey = parseCvTemplateKey(formData.get("templateKey"))
  if (!uuidPattern.test(id) || title.length < 1 || title.length > 120 || rawContent.length > 200000) redirect("/dashboard/resumes?error=Review+the+CV+details.")
  let content: unknown
  try { content = JSON.parse(rawContent) } catch { redirect(`/dashboard/resumes/${id}?error=The+CV+content+is+invalid.`) }
  const identity = await requireProfessional(`/dashboard/resumes/${id}`)
  const { data, error } = await identity.supabase.from("professional_resumes").update({ title, template_key: templateKey, content: parseResumeContent(content) }).eq("id", id).eq("user_id", identity.userId).select("id").maybeSingle()
  if (error || !data) redirect(`/dashboard/resumes/${id}?error=The+CV+could+not+be+saved.`)
  revalidatePath("/dashboard/resumes")
  revalidatePath(`/dashboard/resumes/${id}`)
  redirect(`/dashboard/resumes/${id}?success=CV+saved.`)
}

export async function deleteResume(formData: FormData) {
  const id = String(formData.get("resumeId") ?? "")
  if (!uuidPattern.test(id)) redirect("/dashboard/resumes?error=The+selected+CV+is+invalid.")
  const identity = await requireProfessional("/dashboard/resumes")
  const { error } = await identity.supabase.from("professional_resumes").delete().eq("id", id).eq("user_id", identity.userId)
  if (error) redirect("/dashboard/resumes?error=The+CV+could+not+be+deleted.")
  revalidatePath("/dashboard/resumes")
  redirect("/dashboard/resumes?success=CV+deleted.")
}
