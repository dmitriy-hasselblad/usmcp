import type { Metadata } from "next"
import Link from "next/link"

import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { OrganizationPostForm } from "@/components/employer/organization-post-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = { title: "Create Organization Article" }
export default async function NewOrganizationPostPage() {
  const workspace = await requireEmployerWorkspace("/dashboard/news/new")
  if (!canManageJobs(workspace.membership.role)) return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}><p>You do not have permission to create organization posts.</p></EmployerDashboardShell>
  return <EmployerDashboardShell active="news" email={workspace.email} organizationName={workspace.organization.name}>
    <Button asChild variant="ghost"><Link href="/dashboard/news">← Back to News & insights</Link></Button>
    <div className="mt-5"><EmployerPageHeader eyebrow="Organization publishing" title="Create an article" description="Write in English for a U.S. healthcare audience. Submitted articles require platform review before publication." /></div>
    <Card className="mt-8 bg-white"><CardContent className="p-6"><OrganizationPostForm organizationId={workspace.organization.id} /></CardContent></Card>
  </EmployerDashboardShell>
}
