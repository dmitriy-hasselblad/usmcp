import "server-only"

import { sendApplicationReceivedEmail } from "@/lib/email/application-status"
import { createAdminClient } from "@/lib/supabase/admin"

type NewApplicationEmailInput = {
  applicationId: string
  organizationId: string
  candidateFirstName: string
  candidateLastName: string
  jobTitle: string
  organizationName: string
}

/**
 * Loads only the authorized hiring team through the server-only admin client.
 * Email addresses are never exposed to applicants or to other team members.
 */
export async function notifyHiringTeamOfNewApplication(input: NewApplicationEmailInput) {
  const admin = createAdminClient()
  if (!admin) return { outcome: "skipped" as const, code: "missing_admin_client" }

  const { data: memberships, error: membershipsError } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", input.organizationId)
    .in("role", ["owner", "admin", "recruiter"])

  if (membershipsError) return { outcome: "failed" as const, code: "memberships_unavailable" }

  const userIds = [...new Set((memberships ?? []).map((membership) => membership.user_id))]
  if (!userIds.length) return { outcome: "skipped" as const, code: "no_hiring_team_recipients" }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, first_name, account_type, onboarding_completed")
    .in("id", userIds)

  if (profilesError) return { outcome: "failed" as const, code: "profiles_unavailable" }

  const eligibleProfiles = (profiles ?? []).filter(
    (profile) => profile.account_type === "employer" && profile.onboarding_completed,
  )
  const recipients = await Promise.all(
    eligibleProfiles.map(async (profile) => {
      const { data, error } = await admin.auth.admin.getUserById(profile.id)
      if (error || !data.user?.email) return null
      return { email: data.user.email, firstName: profile.first_name }
    }),
  )

  return sendApplicationReceivedEmail({
    ...input,
    recipients: recipients.filter((recipient): recipient is NonNullable<typeof recipient> => recipient !== null),
  })
}
