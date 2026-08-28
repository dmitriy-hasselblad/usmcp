"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireIdentity } from "@/lib/auth/session"
import { emptyCoverLetterContent, parseCoverLetterContent } from "@/lib/cover-letter/types"

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function professional(path: string) {
  const identity = await requireIdentity(path)
  const { data } = await identity.supabase.from("profiles").select("account_type, onboarding_completed").eq("id", identity.userId).single()
  if (data?.account_type !== "professional" || !data.onboarding_completed) redirect("/onboarding")
  return identity
}

export async function createCoverLetter() {
  const identity = await professional("/dashboard/cover-letters")
  const { count } = await identity.supabase.from("professional_cover_letters").select("id", { count: "exact", head: true }).eq("user_id", identity.userId)
  if ((count ?? 0) >= 10) redirect("/dashboard/cover-letters?error=You+can+keep+up+to+10+cover+letters.")
  const { data, error } = await identity.supabase.from("professional_cover_letters").insert({ user_id: identity.userId, title: "Cover letter", content: emptyCoverLetterContent }).select("id").single()
  if (error || !data) redirect("/dashboard/cover-letters?error=The+cover+letter+could+not+be+created.")
  redirect(`/dashboard/cover-letters/${data.id}`)
}

export async function saveCoverLetter(formData: FormData) {
  const id = String(formData.get("letterId") ?? ""), title = String(formData.get("title") ?? "").trim(), raw = String(formData.get("content") ?? "")
  if (!uuid.test(id) || !title || title.length > 120 || raw.length > 100000) redirect("/dashboard/cover-letters?error=Review+the+cover+letter+details.")
  let content: unknown; try { content = JSON.parse(raw) } catch { redirect(`/dashboard/cover-letters/${id}?error=The+cover+letter+content+is+invalid.`) }
  const identity = await professional(`/dashboard/cover-letters/${id}`)
  const { data, error } = await identity.supabase.from("professional_cover_letters").update({ title, content: parseCoverLetterContent(content) }).eq("id", id).eq("user_id", identity.userId).select("id").maybeSingle()
  if (error || !data) redirect(`/dashboard/cover-letters/${id}?error=The+cover+letter+could+not+be+saved.`)
  revalidatePath("/dashboard/cover-letters"); revalidatePath(`/dashboard/cover-letters/${id}`)
  redirect(`/dashboard/cover-letters/${id}?success=Cover+letter+saved.`)
}

export async function deleteCoverLetter(formData: FormData) {
  const id = String(formData.get("letterId") ?? ""); if (!uuid.test(id)) redirect("/dashboard/cover-letters?error=The+selected+cover+letter+is+invalid.")
  const identity = await professional("/dashboard/cover-letters")
  const { error } = await identity.supabase.from("professional_cover_letters").delete().eq("id", id).eq("user_id", identity.userId)
  if (error) redirect("/dashboard/cover-letters?error=The+cover+letter+could+not+be+deleted.")
  revalidatePath("/dashboard/cover-letters"); redirect("/dashboard/cover-letters?success=Cover+letter+deleted.")
}
