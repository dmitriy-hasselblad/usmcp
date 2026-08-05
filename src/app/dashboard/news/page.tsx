import type { Metadata } from "next"
import Link from "next/link"

import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = { title: "News & Insights" }
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ success?: string | string[] }> }) {
  const [workspace, params] = await Promise.all([requireEmployerWorkspace("/dashboard/news"), searchParams])
  const { data: posts } = await workspace.supabase.from("organization_posts").select("id, slug, title, excerpt, status, moderation_status, created_at, published_at").eq("organization_id", workspace.organization.id).order("created_at", { ascending: false })
  const success = Array.isArray(params.success) ? params.success[0] : params.success
  return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}>
    <div className="flex flex-wrap items-start justify-between gap-4"><EmployerPageHeader eyebrow="Organization publishing" title="News & insights" description="Share organization updates, healthcare insights, and stories with the USHCE community." />{canManageJobs(workspace.membership.role) && <Button asChild><Link href="/dashboard/news/new">Create article</Link></Button>}</div>
      <div className="mt-8"><AuthNotice success={success} />{posts?.length ? <div className="grid gap-4">{posts.map(post => <Card className="bg-white" key={post.id}><CardContent className="p-6"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary" className="capitalize">{post.status}</Badge><Badge variant="outline" className="capitalize">{post.moderation_status}</Badge></div><h2 className="mt-4 text-xl font-semibold">{post.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>{canManageJobs(workspace.membership.role) && post.status !== "published" && <Button asChild className="mt-4" size="sm" variant="outline"><Link href={`/dashboard/news/${post.id}/edit`}>Edit article</Link></Button>}</CardContent></Card>)}</div> : <Card className="bg-white"><CardContent className="p-10 text-center"><h2 className="text-xl font-semibold">No organization stories yet</h2><p className="mt-2 text-sm text-muted-foreground">Create a draft when your team is ready to share an update.</p></CardContent></Card>}</div>
  </EmployerDashboardShell>
}
