import { notFound } from "next/navigation"

import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { OrganizationPostForm } from "@/components/employer/organization-post-form"
import { Card, CardContent } from "@/components/ui/card"
import { canManageJobs, canManageOrganization } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export default async function EditOrganizationPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const workspace = await requireEmployerWorkspace(`/dashboard/news/${id}/edit`)
  if (!canManageJobs(workspace.membership.role)) notFound()
  const { data: post } = await workspace.supabase.from("organization_posts").select("id, author_id, title, excerpt, body, cover_image_path, moderation_status, status").eq("id", id).eq("organization_id", workspace.organization.id).maybeSingle()
  if (!post || post.moderation_status === "blocked" || (post.author_id !== workspace.userId && !canManageOrganization(workspace.membership.role))) notFound()
  const description = post.status === "archived" ? "Update the article, then publish it again when it is ready." : "Update the article and publish changes immediately."
  return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}><EmployerPageHeader eyebrow="Organization publishing" title="Edit article" description={description}/><Card className="mt-8 bg-white"><CardContent className="p-6"><OrganizationPostForm organizationId={workspace.organization.id} post={post}/></CardContent></Card></EmployerDashboardShell>
}
