import type { Metadata } from "next"
import Link from "next/link"

import { AuthNotice } from "@/components/auth/auth-notice"
import { archiveOrganizationPost } from "@/app/dashboard/news/actions"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { canManageJobs, canManageOrganization } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = { title: "News & Insights" }
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ success?: string | string[]; error?: string | string[]; status?: string | string[] }> }) {
  const [workspace, params] = await Promise.all([requireEmployerWorkspace("/dashboard/news"), searchParams])
  const { data: posts } = await workspace.supabase.from("organization_posts").select("id, author_id, slug, title, excerpt, status, moderation_status, moderation_reason, created_at, published_at, archived_at").eq("organization_id", workspace.organization.id).order("created_at", { ascending: false })
  const success = Array.isArray(params.success) ? params.success[0] : params.success
  const error = Array.isArray(params.error) ? params.error[0] : params.error
  const selectedStatus = Array.isArray(params.status) ? params.status[0] : params.status
  const managesAllPosts = canManageOrganization(workspace.membership.role)
  const visiblePosts = selectedStatus && selectedStatus !== "all" ? posts?.filter((post) => post.status === selectedStatus) : posts
  const statuses = ["all", "published", "draft", "archived"] as const
  return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}>
    <div className="flex flex-wrap items-start justify-between gap-4"><EmployerPageHeader eyebrow="Organization publishing" title="News & insights" description="Share organization updates, healthcare insights, and stories with the SM VIA community." />{canManageJobs(workspace.membership.role) && <Button asChild><Link href="/dashboard/news/new">Create article</Link></Button>}</div>
      <div className="mt-8"><AuthNotice error={error} success={success} /><div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-sm text-muted-foreground">{posts?.length ?? 0} {(posts?.length ?? 0) === 1 ? "article" : "articles"}</span>{statuses.map((status) => <Button asChild key={status} size="sm" variant={(selectedStatus ?? "all") === status ? "default" : "outline"}><Link href={status === "all" ? "/dashboard/news" : `/dashboard/news?status=${status}`}>{status[0].toUpperCase() + status.slice(1)}{status !== "all" ? ` (${posts?.filter((post) => post.status === status).length ?? 0})` : ""}</Link></Button>)}</div>{visiblePosts?.length ? <div className="mt-5 grid gap-4">{visiblePosts.map(post => {
        const canManagePost = post.author_id === workspace.userId || managesAllPosts
        const isBlocked = post.moderation_status === "blocked"
        return <Card className="bg-white" key={post.id}><CardContent className="p-6"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary" className="capitalize">{post.status}</Badge><Badge variant="outline" className="capitalize">{post.moderation_status}</Badge></div><h2 className="mt-4 text-xl font-semibold">{post.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>{post.status === "published" && <p className="mt-3 text-xs text-muted-foreground">Live since {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.published_at ?? post.created_at))}</p>}{post.status === "archived" && <p className="mt-3 text-xs text-muted-foreground">Removed from public news {post.archived_at ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.archived_at)) : ""}</p>}{isBlocked && <p className="mt-3 text-sm text-destructive">This article is blocked from public news. {post.moderation_reason || "Contact platform support if you need more information."}</p>}{canManagePost && !isBlocked && <div className="mt-4 flex flex-wrap gap-3"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/news/${post.id}/edit`}>{post.status === "archived" ? "Restore and edit article" : "Edit article"}</Link></Button>{post.status === "published" && <form action={archiveOrganizationPost}><input name="postId" type="hidden" value={post.id}/><Button size="sm" variant="destructive">Remove from public news</Button></form>}</div>}</CardContent></Card>
      })}</div> : <Card className="mt-5 bg-white"><CardContent className="p-10 text-center"><h2 className="text-xl font-semibold">No articles match this filter</h2><p className="mt-2 text-sm text-muted-foreground">Choose another status or create a new article.</p></CardContent></Card>}</div>
  </EmployerDashboardShell>
}
