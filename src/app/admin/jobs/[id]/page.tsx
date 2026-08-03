import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react"

import { changeJobModeration } from "@/app/admin/jobs/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { formatAdminDate } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export default async function AdminJobReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const [identity, { id }, query] = await Promise.all([requirePlatformAdmin(), params, searchParams])
  const { data: job, error } = await identity.supabase.from("jobs").select("id, title, slug, profession, specialty, city, state_code, employment_type, workplace_type, description, status, moderation_status, moderation_reason, moderated_at, created_at, organizations(name, slug)").eq("id", id).maybeSingle()
  if (error || !job) notFound()
  return <AdminShell active="jobs" email={identity.email}>
    <Button asChild size="sm" variant="ghost"><Link href="/admin/jobs"><ArrowLeft /> Back to jobs</Link></Button>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Job review</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{job.title}</h1><p className="mt-3 text-muted-foreground">{job.organizations?.[0]?.name ?? "Unknown organization"} · {job.city}, {job.state_code}</p></div><Badge variant="secondary">{job.moderation_status.replace("_", " ")}</Badge></div>
    <div className="mt-6"><AuthNotice error={first(query.error)} success={first(query.success)} /></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_23rem]"><Card className="bg-white"><CardContent className="p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">Job details</h2>{job.status === "published" && <Button asChild size="sm" variant="outline"><Link href={`/jobs/${job.slug}`}>Public listing <ExternalLink /></Link></Button>}</div><dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2"><Detail label="Employer status" value={job.status} /><Detail label="Profession" value={job.profession} /><Detail label="Specialty" value={job.specialty ?? "Not specified"} /><Detail label="Workplace type" value={job.workplace_type} /><Detail label="Employment type" value={job.employment_type} /><Detail label="Created" value={formatAdminDate(job.created_at)} /></dl><div className="mt-6 border-t pt-5"><p className="text-sm text-muted-foreground">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{job.description || "No description provided."}</p></div></CardContent></Card><Card className="h-fit bg-white"><CardContent className="p-6"><ShieldCheck className="size-6 text-violet-700" /><h2 className="mt-4 text-lg font-semibold">Moderation decision</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Visibility decisions are independent from employer status and recorded in the audit log.</p><div className="mt-6 grid gap-5">{job.moderation_status !== "approved" && <Form id={job.id} label="Approve job" status="approved" />}{job.moderation_status !== "under_review" && <Form id={job.id} label="Move under review" status="under_review" />}{job.moderation_status !== "blocked" && <Form blocked id={job.id} label="Block public visibility" status="blocked" />}</div></CardContent></Card></div>
  </AdminShell>
}

function Form({ id, label, status, blocked = false }: { id: string; label: string; status: "approved" | "under_review" | "blocked"; blocked?: boolean }) { return <form action={changeJobModeration} className="rounded-xl border p-4"><input name="jobId" type="hidden" value={id} /><input name="targetStatus" type="hidden" value={status} /><label className="grid gap-2 text-sm font-medium">Moderation note {blocked ? "(required)" : "(optional)"}<Textarea maxLength={1000} minLength={blocked ? 10 : undefined} name="moderationReason" required={blocked} rows={3} /></label><label className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-1 size-4" name="confirmed" required type="checkbox" />I confirm this visibility decision and understand it will be recorded in the audit log.</label><Button className="mt-4 w-full" type="submit" variant={blocked ? "destructive" : "outline"}>{label}</Button></form> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }
