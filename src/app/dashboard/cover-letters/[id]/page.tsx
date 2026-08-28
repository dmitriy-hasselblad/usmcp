import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AuthNotice } from "@/components/auth/auth-notice"
import { CoverLetterEditor } from "@/components/professional/cover-letter-editor"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { requireIdentity } from "@/lib/auth/session"
import { parseCoverLetterContent } from "@/lib/cover-letter/types"

export const metadata: Metadata = { title: "Edit cover letter", description: "Build a private cover letter." }
const one = (v?: string | string[]) => Array.isArray(v) ? v[0] : v
export default async function CoverLetterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const { id } = await params, identity = await requireIdentity(`/dashboard/cover-letters/${id}`)
  const { data: letter } = await identity.supabase.from("professional_cover_letters").select("id, title, content").eq("id", id).eq("user_id", identity.userId).maybeSingle()
  if (!letter) notFound(); const messages = await searchParams
  return <ProfessionalDashboardShell active="coverLetters" email={identity.email}><div className="mb-6"><AuthNotice error={one(messages.error)} success={one(messages.success)}/></div><CoverLetterEditor initialContent={parseCoverLetterContent(letter.content)} letterId={letter.id} title={letter.title}/></ProfessionalDashboardShell>
}
