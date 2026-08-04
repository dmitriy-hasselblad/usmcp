import type { Metadata } from "next"
import Link from "next/link"
import { BriefcaseBusiness, ExternalLink, Search } from "lucide-react"

import { AdminDirectoryPagination } from "@/components/admin/admin-directory-pagination"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ADMIN_DIRECTORY_PAGE_SIZE, formatAdminDate, normalizeAdminQuery, parseAdminPage } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = { title: "Jobs | Platform administration" }

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const [identity, params] = await Promise.all([requirePlatformAdmin("/admin/jobs"), searchParams])
  const page = parseAdminPage(params.page)
  const query = normalizeAdminQuery(params.q)
  const moderationStatus = ["approved", "under_review", "blocked"].includes(params.status ?? "") ? params.status : undefined
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE
  let jobsQuery = identity.supabase.from("jobs").select("id, title, slug, city, state_code, status, moderation_status, created_at, organizations(name)", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + ADMIN_DIRECTORY_PAGE_SIZE - 1)
  if (query) jobsQuery = jobsQuery.ilike("title", `%${query}%`)
  if (moderationStatus) jobsQuery = jobsQuery.eq("moderation_status", moderationStatus)
  const { data: jobs, count, error } = await jobsQuery

  return <AdminShell active="jobs" email={identity.email}>
    <div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><BriefcaseBusiness className="size-5" /></span><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Platform administration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Jobs</h1><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Review marketplace visibility without changing the employer-managed job lifecycle.</p></div></div>
    <div className="mt-8 flex flex-wrap gap-2">{[["All jobs", ""], ["Approved", "approved"], ["Under review", "under_review"], ["Blocked", "blocked"]].map(([label, status]) => <Button asChild key={status} size="sm" variant={(moderationStatus ?? "") === status ? "default" : "outline"}><Link href={status ? `/admin/jobs?status=${status}` : "/admin/jobs"}>{label}</Link></Button>)}</div>
    <form action="/admin/jobs" className="mt-4 flex max-w-xl gap-2" method="get">{moderationStatus && <input name="status" type="hidden" value={moderationStatus} />}<Input aria-label="Search jobs by title" defaultValue={query} name="q" placeholder="Search by job title" /><Button type="submit" variant="outline"><Search /> Search</Button></form>
    <Card className="mt-6 bg-white"><CardContent className="p-0">{error ? <Message title="Jobs could not be loaded" description="Refresh the page and review Supabase access if the issue continues." /> : jobs?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[58rem] text-left text-sm"><thead className="border-b bg-muted/35 text-xs uppercase text-muted-foreground"><tr><th className="px-6 py-3">Job</th><th className="px-5 py-3">Organization</th><th className="px-5 py-3">Employer status</th><th className="px-5 py-3">Moderation</th><th className="px-5 py-3">Created</th><th className="px-6 py-3"><span className="sr-only">Review</span></th></tr></thead><tbody className="divide-y">{jobs.map((job) => <tr key={job.id}><td className="px-6 py-4"><p className="font-semibold">{job.title}</p><p className="mt-1 text-xs text-muted-foreground">{job.city}, {job.state_code}</p></td><td className="px-5 py-4">{job.organizations?.[0]?.name ?? "Unknown"}</td><td className="px-5 py-4"><Badge variant="secondary">{job.status}</Badge></td><td className="px-5 py-4"><ModerationBadge status={job.moderation_status} /></td><td className="px-5 py-4 text-muted-foreground">{formatAdminDate(job.created_at)}</td><td className="px-6 py-4 text-right"><Button asChild size="sm" variant="ghost"><Link href={`/admin/jobs/${job.id}`}>Review <ExternalLink /></Link></Button></td></tr>)}</tbody></table></div> : <Message title={query ? "No matching jobs" : "No jobs in this view"} description={query ? "Try a different job title." : "Jobs will appear here when employers create them."} />}{!error && <AdminDirectoryPagination basePath="/admin/jobs" page={page} pageSize={ADMIN_DIRECTORY_PAGE_SIZE} query={query} status={moderationStatus} total={count ?? 0} />}</CardContent></Card>
  </AdminShell>
}

function ModerationBadge({ status }: { status: string }) { return <Badge className={status === "approved" ? "bg-emerald-100 text-emerald-800" : status === "blocked" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"} variant="secondary">{status.replace("_", " ")}</Badge> }
function Message({ title, description }: { title: string; description: string }) { return <div className="px-6 py-12 text-center"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div> }
