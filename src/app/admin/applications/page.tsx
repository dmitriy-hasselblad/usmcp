import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, FileText, Search } from "lucide-react"

import { AdminDirectoryPagination } from "@/components/admin/admin-directory-pagination"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ADMIN_DIRECTORY_PAGE_SIZE, formatAdminDate, normalizeAdminQuery, parseAdminPage } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = {
  title: "Applications | Platform administration",
  description: "Read-only SM VIA application directory for platform administrators.",
}

type ApplicationsPageProps = { searchParams: Promise<{ page?: string; q?: string }> }

export default async function AdminApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const [identity, params] = await Promise.all([requirePlatformAdmin("/admin/applications"), searchParams])
  const page = parseAdminPage(params.page)
  const query = normalizeAdminQuery(params.q)
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE

  let applicationsQuery = identity.supabase
    .from("applications")
    .select("id, job_id, job_title, organization_name, candidate_first_name, candidate_last_name, candidate_email, status, submitted_at", { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(from, from + ADMIN_DIRECTORY_PAGE_SIZE - 1)

  if (query) applicationsQuery = applicationsQuery.or(`job_title.ilike.%${query}%,organization_name.ilike.%${query}%,candidate_first_name.ilike.%${query}%,candidate_last_name.ilike.%${query}%`)

  const { data: applications, count, error } = await applicationsQuery

  return (
    <AdminShell active="applications" email={identity.email}>
      <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"><FileText className="size-5" /></span><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Platform administration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Applications</h1><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Read-only oversight of application activity. Candidate data is shown only within the protected platform-admin boundary.</p></div></div>
      <form action="/admin/applications" className="mt-8 flex max-w-xl gap-2" method="get"><Input aria-label="Search applications" defaultValue={query} name="q" placeholder="Search candidate, job, or organization" /><Button type="submit" variant="outline"><Search /> Search</Button></form>
      <Card className="mt-6 bg-white"><CardContent className="p-0">{error ? <Message title="Applications could not be loaded" description="Refresh the page and review admin access if the issue continues." /> : applications?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[60rem] text-left text-sm"><thead className="border-b bg-muted/35 text-xs uppercase text-muted-foreground"><tr><th className="px-6 py-3">Candidate</th><th className="px-5 py-3">Job</th><th className="px-5 py-3">Organization</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Submitted</th><th className="px-6 py-3"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y">{applications.map((application) => <tr key={application.id}><td className="px-6 py-4"><p className="font-semibold">{application.candidate_first_name} {application.candidate_last_name}</p><p className="mt-1 text-xs text-muted-foreground">{application.candidate_email}</p></td><td className="px-5 py-4">{application.job_title}</td><td className="px-5 py-4">{application.organization_name}</td><td className="px-5 py-4"><Badge variant="secondary">{application.status}</Badge></td><td className="px-5 py-4 text-muted-foreground">{formatAdminDate(application.submitted_at)}</td><td className="px-6 py-4 text-right"><Button asChild size="sm" variant="ghost"><Link href={`/admin/jobs/${application.job_id}`}>Job <ExternalLink /></Link></Button></td></tr>)}</tbody></table></div> : <Message title={query ? "No matching applications" : "No applications yet"} description={query ? "Try a broader search." : "Applications will appear here as candidates apply."} />}{!error && <AdminDirectoryPagination basePath="/admin/applications" page={page} pageSize={ADMIN_DIRECTORY_PAGE_SIZE} query={query} total={count ?? 0} />}</CardContent></Card>
    </AdminShell>
  )
}

function Message({ description, title }: { description: string; title: string }) { return <div className="px-6 py-12 text-center"><h2 className="font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p></div> }
