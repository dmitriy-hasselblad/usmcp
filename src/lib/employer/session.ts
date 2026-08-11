import { redirect } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import type { OrganizationMemberRole } from "@/lib/employer/constants"

export type EmployerWorkspace = {
  supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"]
  userId: string
  email?: string
  profile: {
    first_name: string | null
    last_name: string | null
  }
  membership: {
    organization_id: string
    role: OrganizationMemberRole
    position_title: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    organization_type: string
    state_code: string
    description: string | null
    website: string | null
    public_email: string | null
    public_phone: string | null
    address_line1: string | null
    address_line2: string | null
    city: string | null
    postal_code: string | null
    verification_status: string
  }
}

export async function requireEmployerWorkspace(
  nextPath = "/dashboard",
): Promise<EmployerWorkspace> {
  const identity = await requireIdentity(nextPath)
  const { supabase, userId } = identity
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, first_name, last_name, onboarding_completed")
    .eq("id", userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type !== "employer") {
    redirect("/dashboard")
  }

  const { data: employerProfile } = await supabase
    .from("employer_profiles")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle()

  let membershipQuery = supabase
    .from("organization_members")
    .select("organization_id, role, position_title")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)

  if (employerProfile?.organization_id) {
    membershipQuery = membershipQuery.eq(
      "organization_id",
      employerProfile.organization_id,
    )
  }

  const { data: membership } = await membershipQuery.maybeSingle()

  if (!membership) {
    redirect("/dashboard/workspace-unavailable")
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, organization_type, state_code, description, website, public_email, public_phone, address_line1, address_line2, city, postal_code, verification_status",
    )
    .eq("id", membership.organization_id)
    .single()

  if (!organization) {
    redirect("/dashboard/workspace-unavailable")
  }

  return {
    ...identity,
    profile: {
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
    membership: {
      ...membership,
      role: membership.role as OrganizationMemberRole,
    },
    organization,
  }
}
