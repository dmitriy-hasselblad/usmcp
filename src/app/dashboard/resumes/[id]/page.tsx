import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AuthNotice } from "@/components/auth/auth-notice"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { ResumeEditor } from "@/components/professional/resume-editor"
import { requireIdentity } from "@/lib/auth/session"
import { parseCvTemplateKey, parseResumeContent } from "@/lib/resume/types"
import { getResumeExportAccess } from "@/lib/resume/export-access"

export const metadata: Metadata = { title: "Edit CV", description: "Build a private U.S. healthcare CV." }
const one = (value?: string | string[]) => Array.isArray(value) ? value[0] : value

export default async function ResumePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const { id } = await params
  const identity = await requireIdentity(`/dashboard/resumes/${id}`)
  const { data: resume } = await identity.supabase.from("professional_resumes").select("id, title, content, template_key").eq("id", id).eq("user_id", identity.userId).maybeSingle()
  if (!resume) notFound()
  const messages = await searchParams
  return <ProfessionalDashboardShell active="resumes" email={identity.email}>
    <div className="mb-6"><AuthNotice error={one(messages.error)} success={one(messages.success)}/></div>
    <ResumeEditor exportAccess={getResumeExportAccess()} initialContent={parseResumeContent(resume.content)} initialTemplateKey={parseCvTemplateKey(resume.template_key)} resumeId={resume.id} title={resume.title}/>
  </ProfessionalDashboardShell>
}
