"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, isValidEmail, messagePath } from "@/lib/auth/validation"
import { requireIdentity } from "@/lib/auth/session"

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function submitOrganizationClaim(formData: FormData) {
  const organizationId = formString(formData, "organizationId")
  const slug = formString(formData, "slug")
  const claimantTitle = formString(formData, "claimantTitle")
  const workEmail = formString(formData, "workEmail").toLowerCase()
  const relationship = formString(formData, "relationship")
  const confirmed = formData.get("confirmed") === "on"
  const returnPath = slugPattern.test(slug)
    ? `/companies/${slug}/claim`
    : "/companies"
  const identity = await requireIdentity(returnPath)

  if (
    !uuidPattern.test(organizationId) ||
    claimantTitle.length < 2 ||
    claimantTitle.length > 120 ||
    !isValidEmail(workEmail) ||
    relationship.length < 20 ||
    relationship.length > 1500 ||
    !confirmed
  ) {
    redirect(
      messagePath(
        returnPath,
        "error",
        "Complete every field and provide at least 20 characters about your relationship to this organization.",
      ),
    )
  }

  const { error } = await identity.supabase.from("organization_claims").insert({
    organization_id: organizationId,
    claimant_id: identity.userId,
    claimant_title: claimantTitle,
    work_email: workEmail,
    relationship,
  })

  if (error) {
    redirect(
      messagePath(
        returnPath,
        "error",
        "We could not submit this claim. It may already be under review, or this account is not eligible to claim a public employer profile.",
      ),
    )
  }

  revalidatePath(`/companies/${slug}`)
  redirect(
    messagePath(
      returnPath,
      "success",
      "Your ownership claim is under review. We will contact you after verification.",
    ),
  )
}
