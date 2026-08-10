import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FilePlus2, FileText, ShieldCheck } from "lucide-react"

import { AuthNotice } from "@/components/auth/auth-notice"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"
import { createResume, deleteResume } from "./actions"

export const metadata: Metadata = { title: "Résumé Builder", description: "Create private, ATS-friendly U.S. healthcare résumés." }

const one = (value?: string | string[]) => Array.isArray(value) ? value[0] : value

export default async function ResumesPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const identity = await requireIdentity("/dashboard/resumes")
  const [{ data: account }, { data: resumes, error: resumesError }] = await Promise.all([
    identity.supabase.from("profiles").select("account_type, onboarding_completed").eq("id", identity.userId).single(),
    identity.supabase.from("professional_resumes").select("id, title, updated_at").eq("user_id", identity.userId).order("updated_at", { ascending: false }),
  ])
  if (!account?.onboarding_completed) redirect("/onboarding")
  if (account.account_type !== "professional") redirect("/dashboard")
  const params = await searchParams

  return <ProfessionalDashboardShell active="resumes" email={identity.email}>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Private document workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">My résumés</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Create ATS-friendly U.S. healthcare résumés from a blank document. Nothing is copied from your profile unless you type it here.</p></div>
      <form action={createResume}><Button size="lg"><FilePlus2/>Create blank résumé</Button></form>
    </div>
    <div className="mt-6"><AuthNotice error={one(params.error) ?? (resumesError ? "Your résumé drafts could not be loaded." : undefined)} success={one(params.success)}/></div>
    <div className="mt-7 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p>Résumés are private and available only to you. PDF export is free during Early Access. Payment can be added later without changing your saved documents.</p></div>
    <div className="mt-7 grid gap-4">
      {(resumes ?? []).map((resume) => <Card key={resume.id} className="bg-white"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold">{resume.title}</h2><p className="mt-1 text-xs text-muted-foreground">Updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(resume.updated_at))}</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href={`/dashboard/resumes/${resume.id}`}><FileText/>Open</Link></Button><form action={deleteResume}><input name="resumeId" type="hidden" value={resume.id}/><Button type="submit" variant="destructive">Delete</Button></form></div></CardContent></Card>)}
      {(resumes ?? []).length === 0 && <Card className="border-dashed bg-white"><CardContent className="py-12 text-center"><FileText className="mx-auto size-8 text-muted-foreground"/><h2 className="mt-4 font-semibold">Start with a blank résumé</h2><p className="mt-2 text-sm text-muted-foreground">You can keep up to 10 separate versions for different roles.</p></CardContent></Card>}
    </div>
  </ProfessionalDashboardShell>
}
