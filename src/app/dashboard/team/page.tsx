import type { Metadata } from "next"
import { headers } from "next/headers"

import { createTeamInvitation, removeTeamMember, revokeTeamInvitation, updateTeamMember } from "./actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { assignableOrganizationRoles, canManageOrganization } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { getSiteUrl } from "@/lib/supabase/env"

export const metadata: Metadata = { title: "Team & Access", description: "Manage your employer workspace team." }
type SearchParams = Promise<{ error?: string | string[]; success?: string | string[]; invite?: string | string[] }>
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
const selectClass = "h-10 rounded-lg border border-input bg-background px-3 text-sm"

export default async function TeamPage({ searchParams }: { searchParams: SearchParams }) {
  const [workspace, params, requestHeaders] = await Promise.all([requireEmployerWorkspace("/dashboard/team"), searchParams, headers()])
  const canManage = canManageOrganization(workspace.membership.role)
  const [{ data: members }, { data: invitations }, { data: activity }] = await Promise.all([
    workspace.supabase.from("organization_members").select("user_id, role, position_title, created_at, profiles!organization_members_user_id_fkey(first_name, last_name)").eq("organization_id", workspace.organization.id).order("created_at"),
    canManage ? workspace.supabase.from("organization_invitations").select("id, email, role, expires_at, accepted_at, revoked_at, created_at").eq("organization_id", workspace.organization.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    workspace.supabase.from("organization_activity_events").select("id, action, metadata, created_at, profiles!organization_activity_events_actor_user_id_fkey(first_name, last_name)").eq("organization_id", workspace.organization.id).order("created_at", { ascending: false }).limit(12),
  ])
  const token = first(params.invite)
  const forwardedHost = requestHeaders.get("x-forwarded-host")
  const requestHost = forwardedHost ?? requestHeaders.get("host")
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")
  const requestProtocol = forwardedProtocol === "http" ? "http" : "https"
  const requestOrigin =
    requestHost && /^[a-z0-9.-]+(?::\d+)?$/i.test(requestHost)
      ? `${requestProtocol}://${requestHost}`
      : getSiteUrl()
  const inviteUrl = token ? `${requestOrigin}/invite/${token}` : null

  return <EmployerDashboardShell active="team" email={workspace.email} organizationName={workspace.organization.name}>
    <EmployerPageHeader eyebrow="Workspace settings" title="Team & access" description="Invite colleagues and control who can manage hiring in this organization." />
    <div className="mt-8 grid gap-6">
      <AuthNotice error={first(params.error)} success={first(params.success)} />
      <Card className="bg-white"><CardContent className="p-6"><h2 className="text-lg font-semibold">Workspace roles</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><RoleCard title="Owner" description="Full control of the organization, hiring, team access, and settings." /><RoleCard title="Admin" description="Manages the organization profile, team access, jobs, applicants, and articles." /><RoleCard title="Recruiter" description="Manages jobs, applicants, interviews, and articles, without access to organization settings." /><RoleCard title="Viewer" description="Can review the workspace but cannot make changes." /></div></CardContent></Card>
      {inviteUrl && <Card className="border-teal-200 bg-teal-50"><CardContent className="p-5"><p className="font-semibold">Secure invitation link</p><p className="mt-1 text-sm text-muted-foreground">This link is shown once and expires in 7 days. Share it only with the invited person.</p><Input className="mt-3 bg-white" readOnly value={inviteUrl} /></CardContent></Card>}
      {canManage && <Card className="bg-white"><CardContent className="p-6"><h2 className="text-lg font-semibold">Invite a team member</h2><form action={createTeamInvitation} className="mt-4 grid gap-4 sm:grid-cols-[1fr_12rem_auto]"><Input name="email" type="email" placeholder="colleague@example.com" required maxLength={254} /><select className={selectClass} name="role" defaultValue="recruiter">{assignableOrganizationRoles.map(role => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select><AuthSubmitButton pendingLabel="Creating...">Create invitation</AuthSubmitButton></form></CardContent></Card>}
      <Card className="bg-white"><CardContent className="p-0"><div className="border-b p-6"><h2 className="text-lg font-semibold">Team members</h2></div><div className="divide-y">{members?.map(member => { const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles; const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Team member"; return <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center" key={member.user_id}><div className="min-w-0 flex-1"><p className="font-semibold">{name}{member.user_id === workspace.userId ? " (you)" : ""}</p><p className="text-sm text-muted-foreground">{member.position_title || "No position title"}</p></div><Badge variant="outline" className="w-fit capitalize">{member.role}</Badge>{canManage && member.role !== "owner" && <><form action={updateTeamMember} className="flex gap-2"><input type="hidden" name="userId" value={member.user_id}/><select className={selectClass} name="role" defaultValue={member.role}>{assignableOrganizationRoles.map(role => <option key={role} value={role}>{role}</option>)}</select><Button variant="outline">Update</Button></form>{member.user_id !== workspace.userId && <form action={removeTeamMember}><input type="hidden" name="userId" value={member.user_id}/><Button variant="destructive">Remove</Button></form>}</>}</div>})}</div></CardContent></Card>
      {canManage && <Card className="bg-white"><CardContent className="p-0"><div className="border-b p-6"><h2 className="text-lg font-semibold">Invitations</h2></div><div className="divide-y">{invitations?.length ? invitations.map(invite => { const active = !invite.accepted_at && !invite.revoked_at && new Date(invite.expires_at) > new Date(); return <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center" key={invite.id}><div className="flex-1"><p className="font-semibold">{invite.email}</p><p className="text-sm text-muted-foreground capitalize">{invite.role} · {active ? "Pending" : invite.accepted_at ? "Accepted" : invite.revoked_at ? "Revoked" : "Expired"}</p></div>{active && <form action={revokeTeamInvitation}><input type="hidden" name="invitationId" value={invite.id}/><Button variant="outline">Revoke</Button></form>}</div>}) : <p className="p-6 text-sm text-muted-foreground">No invitations yet.</p>}</div></CardContent></Card>}
      <Card className="bg-white"><CardContent className="p-0"><div className="border-b p-6"><h2 className="text-lg font-semibold">Recent workspace activity</h2><p className="mt-1 text-sm text-muted-foreground">A record of profile and team-access changes.</p></div><div className="divide-y">{activity?.length ? activity.map((event) => { const profile = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles; const actor = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "A team member"; return <div className="p-5" key={event.id}><p className="font-medium">{activityLabel(event.action)}</p><p className="mt-1 text-sm text-muted-foreground">{actor} · {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.created_at))}</p></div> }) : <p className="p-6 text-sm text-muted-foreground">New organization and team changes will appear here.</p>}</div></CardContent></Card>
    </div>
  </EmployerDashboardShell>
}

function RoleCard({ title, description }: { title: string; description: string }) { return <div className="rounded-xl border border-border p-4"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div> }

function activityLabel(action: string) {
  const labels: Record<string, string> = { "organization.profile_updated": "Organization profile updated", "team.member_added": "Team member added", "team.member_role_updated": "Team member role updated", "team.member_removed": "Team member removed", "team.invitation_created": "Team invitation created", "team.invitation_revoked": "Team invitation revoked" }
  return labels[action] ?? "Workspace activity recorded"
}
