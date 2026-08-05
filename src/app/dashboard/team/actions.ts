"use server"

import { createHash, randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, isValidEmail, messagePath } from "@/lib/auth/validation"
import {
  canManageOrganization,
  isAssignableOrganizationRole,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

const teamPath = "/dashboard/team"

export async function createTeamInvitation(formData: FormData) {
  const workspace = await requireEmployerWorkspace(teamPath)
  if (!canManageOrganization(workspace.membership.role)) {
    redirect(messagePath(teamPath, "error", "You do not have permission to invite team members."))
  }

  const email = formString(formData, "email").toLowerCase()
  const role = formString(formData, "role")
  if (!isValidEmail(email) || !isAssignableOrganizationRole(role)) {
    redirect(messagePath(teamPath, "error", "Enter a valid email address and team role."))
  }

  const token = randomBytes(32).toString("hex")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await workspace.supabase
    .from("organization_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("organization_id", workspace.organization.id)
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .lte("expires_at", new Date().toISOString())
  const { error } = await workspace.supabase.from("organization_invitations").insert({
    organization_id: workspace.organization.id,
    email,
    role,
    token_hash: tokenHash,
    invited_by: workspace.userId,
    expires_at: expiresAt,
  })

  if (error) {
    redirect(messagePath(teamPath, "error", "An active invitation already exists for this email, or it could not be created."))
  }

  revalidatePath(teamPath)
  redirect(`${messagePath(teamPath, "success", "Invitation created. Copy and share the secure link below.")}&invite=${token}`)
}

export async function revokeTeamInvitation(formData: FormData) {
  const workspace = await requireEmployerWorkspace(teamPath)
  const invitationId = formString(formData, "invitationId")
  if (!canManageOrganization(workspace.membership.role) || !invitationId) {
    redirect(messagePath(teamPath, "error", "The invitation could not be revoked."))
  }
  const { error } = await workspace.supabase
    .from("organization_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("organization_id", workspace.organization.id)
    .is("accepted_at", null)
  revalidatePath(teamPath)
  redirect(messagePath(teamPath, error ? "error" : "success", error ? "The invitation could not be revoked." : "Invitation revoked."))
}

export async function updateTeamMember(formData: FormData) {
  const workspace = await requireEmployerWorkspace(teamPath)
  const userId = formString(formData, "userId")
  const role = formString(formData, "role")
  if (!canManageOrganization(workspace.membership.role) || !userId || !isAssignableOrganizationRole(role)) {
    redirect(messagePath(teamPath, "error", "The team role could not be changed."))
  }
  const { error } = await workspace.supabase
    .from("organization_members")
    .update({ role })
    .eq("organization_id", workspace.organization.id)
    .eq("user_id", userId)
    .neq("role", "owner")
  revalidatePath(teamPath)
  redirect(messagePath(teamPath, error ? "error" : "success", error ? "The team role could not be changed." : "Team role updated."))
}

export async function removeTeamMember(formData: FormData) {
  const workspace = await requireEmployerWorkspace(teamPath)
  const userId = formString(formData, "userId")
  if (!canManageOrganization(workspace.membership.role) || !userId || userId === workspace.userId) {
    redirect(messagePath(teamPath, "error", "The team member could not be removed."))
  }
  const { error } = await workspace.supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", workspace.organization.id)
    .eq("user_id", userId)
    .neq("role", "owner")
  revalidatePath(teamPath)
  redirect(messagePath(teamPath, error ? "error" : "success", error ? "The team member could not be removed." : "Team member removed."))
}

export async function acceptTeamInvitation(formData: FormData) {
  const token = formString(formData, "token")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const workspace = await requireEmployerWorkspace(`/invite/${token}`)
  const { error } = await workspace.supabase.rpc("accept_organization_invitation", {
    invitation_token_hash: tokenHash,
  })
  if (error) redirect(`/invite/${token}?error=${encodeURIComponent(error.message)}`)
  revalidatePath("/dashboard", "layout")
  redirect(messagePath(teamPath, "success", "Invitation accepted. You are now working in the invited organization."))
}
