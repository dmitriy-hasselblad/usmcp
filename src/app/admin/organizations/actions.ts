"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import { requirePlatformAdmin } from "@/lib/admin/session"

const organizationIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const allowedStatuses = ["pending", "verified", "rejected"] as const

export async function permanentlyDeleteOrganization(formData: FormData) {
  const organizationId = formString(formData, "organizationId")
  const confirmed = formData.get("confirmed") === "on"
  const confirmation = formString(formData, "confirmation")
  const identity = await requirePlatformAdmin("/admin/organizations")

  if (!organizationIdPattern.test(organizationId) || !confirmed || confirmation !== "DELETE") {
    redirect(messagePath(`/admin/organizations/${organizationId}`, "error", "Type DELETE and confirm the permanent removal."))
  }

  const { error } = await identity.supabase.rpc("delete_organization_as_platform_admin", { target_organization_id: organizationId })
  if (error) {
    redirect(messagePath(`/admin/organizations/${organizationId}`, "error", "The organization could not be deleted. Organizations with applications are protected."))
  }

  revalidatePath("/admin")
  revalidatePath("/admin/organizations")
  revalidatePath("/admin/jobs")
  revalidatePath("/companies")
  revalidatePath("/jobs")
  redirect(messagePath("/admin/organizations", "success", "Organization permanently deleted."))
}

export async function changeOrganizationVerification(formData: FormData) {
  const organizationId = formString(formData, "organizationId")
  const targetStatus = formString(formData, "targetStatus")
  const moderationReason = formString(formData, "moderationReason")
  const confirmed = formData.get("confirmed") === "on"
  const returnPath = organizationIdPattern.test(organizationId)
    ? `/admin/organizations/${organizationId}`
    : "/admin/organizations"

  const identity = await requirePlatformAdmin(returnPath)

  if (
    !organizationIdPattern.test(organizationId) ||
    !allowedStatuses.some((status) => status === targetStatus) ||
    !confirmed ||
    moderationReason.length > 1000 ||
    (targetStatus === "rejected" && moderationReason.length < 10)
  ) {
    redirect(
      messagePath(
        returnPath,
        "error",
        "Confirm the decision and review the moderation note.",
      ),
    )
  }

  const { error } = await identity.supabase.rpc(
    "set_organization_verification",
    {
      target_organization_id: organizationId,
      target_status: targetStatus,
      moderation_reason: moderationReason || null,
    },
  )

  if (error) {
    redirect(
      messagePath(
        returnPath,
        "error",
        "The verification status could not be updated.",
      ),
    )
  }

  revalidatePath("/admin")
  revalidatePath("/admin/organizations")
  revalidatePath(returnPath)
  revalidatePath("/companies")
  revalidatePath("/companies/[slug]", "page")
  redirect(
    messagePath(
      returnPath,
      "success",
      `Organization verification changed to ${targetStatus}.`,
    ),
  )
}
