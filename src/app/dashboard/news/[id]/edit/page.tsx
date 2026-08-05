import { notFound } from "next/navigation"

import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { OrganizationPostForm } from "@/components/employer/organization-post-form"
import { Card, CardContent } from "@/components/ui/card"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export default async function EditOrganizationPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const workspace = await requireEmployerWorkspace(`/dashboard/news/${id}/edit`)
  if (!canManageJobs(workspace.membership.role)) notFound()
  const { data: post } = await workspace.supabase.from("organization_posts").select("id, title, excerpt, body, cover_image_path").eq("id", id).eq("organization_id", workspace.organization.id).maybeSingle()
  if (!post) notFound()
  return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}><EmployerPageHeader eyebrow="Organization publishing" title="Edit article" description="Update the draft or submit it for platform review."/><Card className="mt-8 bg-white"><CardContent className="p-6"><OrganizationPostForm organizationId={workspace.organization.id} post={post}/></CardContent></Card></EmployerDashboardShell>
}
