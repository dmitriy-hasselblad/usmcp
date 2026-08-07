import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Flag } from "lucide-react"

import { reviewAbuseReport } from "./actions"
import { AdminDirectoryPagination } from "@/components/admin/admin-directory-pagination"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_DIRECTORY_PAGE_SIZE, formatAdminDate, parseAdminPage } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = { title: "Abuse Reports | Platform administration" }

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; page?: string; status?: string; success?: string | string[]; target?: string }> }) {
  const [identity, params] = await Promise.all([requirePlatformAdmin("/admin/reports"), searchParams])
  const page = parseAdminPage(params.page)
  const status = ["open", "resolved", "dismissed"].includes(params.status ?? "") ? params.status : "open"
  const target = ["job", "organization", "organization_post"].includes(params.target ?? "") ? params.target : undefined
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE
  let query = identity.supabase.from("abuse_reports").select("id, reporter_id, target_type, target_id, category, details, status, resolution_note, created_at, reviewed_at", { count: "exact" }).eq("status", status).order("created_at", { ascending: false }).range(from, from + ADMIN_DIRECTORY_PAGE_SIZE - 1)
  if (target) query = query.eq("target_type", target)
  const { data: reports, count, error } = await query
  const one = (v?: string | string[]) => Array.isArray(v) ? v[0] : v
  return <AdminShell active="reports" email={identity.email}><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-800"><Flag className="size-5"/></span><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Platform administration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Abuse reports</h1><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Review member-submitted concerns about public jobs, organizations, and News articles.</p></div></div><div className="mt-6"><AuthNotice error={one(params.error)} success={one(params.success)}/></div><div className="mt-6 flex flex-wrap gap-2">{["open", "resolved", "dismissed"].map(value => <Button asChild key={value} size="sm" variant={status === value ? "default" : "outline"}><Link href={`/admin/reports?status=${value}`}>{value[0].toUpperCase()+value.slice(1)}</Link></Button>)}</div><form action="/admin/reports" className="mt-4 flex max-w-xs gap-2"><input name="status" type="hidden" value={status}/><select className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={target ?? ""} name="target"><option value="">All content types</option><option value="job">Jobs</option><option value="organization">Organizations</option><option value="organization_post">News articles</option></select><Button variant="outline">Filter</Button></form><div className="mt-6 grid gap-5">{error ? <Message text="Reports could not be loaded."/> : reports?.length ? reports.map(report => <Card className="bg-white" key={report.id}><CardContent className="p-6"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{report.target_type.replaceAll("_", " ")}</Badge><Badge variant="outline">{report.category}</Badge><Badge>{report.status}</Badge></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7">{report.details}</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span>Submitted {formatAdminDate(report.created_at)}</span><span className="font-mono">{report.target_id}</span><Button asChild size="sm" variant="ghost"><Link href={targetHref(report.target_type, report.target_id)}>Review target <ExternalLink/></Link></Button></div>{report.status === "open" ? <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-2"><DecisionForm id={report.id} status="resolved"/><DecisionForm id={report.id} status="dismissed"/></div> : report.resolution_note && <p className="mt-5 border-t pt-5 text-sm text-muted-foreground"><span className="font-medium text-foreground">Resolution:</span> {report.resolution_note}</p>}</CardContent></Card>) : <Message text="No reports in this view."/>}</div>{!error && <Card className="mt-6 bg-white"><CardContent className="p-0"><AdminDirectoryPagination basePath="/admin/reports" page={page} pageSize={ADMIN_DIRECTORY_PAGE_SIZE} params={{ target }} status={status} total={count ?? 0}/></CardContent></Card>}</AdminShell>
}

function DecisionForm({ id, status }: { id: string; status: "resolved" | "dismissed" }) { return <form action={reviewAbuseReport} className="grid gap-3 rounded-xl border p-4"><input name="reportId" type="hidden" value={id}/><input name="status" type="hidden" value={status}/><Textarea maxLength={1000} minLength={2} name="note" placeholder="Required resolution note" required/><label className="flex gap-2 text-xs text-muted-foreground"><input className="size-4" name="confirmed" required type="checkbox"/>I confirm this review decision.</label><Button variant={status === "resolved" ? "default" : "outline"}>Mark {status}</Button></form> }
function Message({ text }: { text: string }) { return <Card className="bg-white"><CardContent className="p-10 text-center text-sm text-muted-foreground">{text}</CardContent></Card> }
function targetHref(type: string, id: string) { if (type === "job") return `/admin/jobs/${id}`; if (type === "organization") return `/admin/organizations/${id}`; return "/admin/news" }
