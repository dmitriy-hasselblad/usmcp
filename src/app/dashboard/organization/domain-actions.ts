"use server"

import { randomBytes } from "node:crypto"
import { resolveTxt } from "node:dns/promises"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import { canManageOrganization } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

const domainPath = "/dashboard/organization"

function domainError(message: string): never {
  redirect(messagePath(domainPath, "error", message))
}

function normalizeDomain(value: string) {
  const candidate = value.trim().toLowerCase().replace(/\.$/, "")
  const domain = candidate.startsWith("www.") ? candidate.slice(4) : candidate

  if (
    domain.length < 3 ||
    domain.length > 253 ||
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      domain,
    )
  ) {
    return null
  }

  return domain
}

function verificationRecordName(domain: string) {
  return `_ushce-verification.${domain}`
}

function verificationToken() {
  return randomBytes(32).toString("base64url")
}

async function managedWorkspace() {
  const workspace = await requireEmployerWorkspace(domainPath)
  if (!canManageOrganization(workspace.membership.role)) {
    domainError("Only organization owners and admins can manage domain verification.")
  }
  return workspace
}

export async function startOrganizationDomainVerification(formData: FormData) {
  const workspace = await managedWorkspace()
  const domain = normalizeDomain(formString(formData, "domain"))

  if (!domain) {
    domainError("Enter a valid organization domain, such as example.org.")
  }

  const { data: existing } = await workspace.supabase
    .from("organization_domain_verifications")
    .select("id")
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  const values = {
    domain,
    verification_token: verificationToken(),
    verified_at: null,
    last_checked_at: null,
  }

  const request = existing
    ? workspace.supabase
        .from("organization_domain_verifications")
        .update(values)
        .eq("id", existing.id)
        .eq("organization_id", workspace.organization.id)
    : workspace.supabase.from("organization_domain_verifications").insert({
        ...values,
        organization_id: workspace.organization.id,
        created_by: workspace.userId,
      })

  const { error } = await request
  if (error) {
    domainError(
      "We could not start domain verification. A different organization may already be using this domain.",
    )
  }

  revalidatePath(domainPath)
  redirect(
    messagePath(
      domainPath,
      "success",
      "DNS verification record created. Add it to your domain, then check verification.",
    ),
  )
}

export async function checkOrganizationDomainVerification() {
  const workspace = await managedWorkspace()
  const { data: verification } = await workspace.supabase
    .from("organization_domain_verifications")
    .select("id, domain, verification_token")
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  if (!verification) {
    domainError("Start domain verification before checking the DNS record.")
  }

  const recordName = verificationRecordName(verification.domain)
  let verified = false

  try {
    const records = await resolveTxt(recordName)
    verified = records.some(
      (chunks) => chunks.join("") === verification.verification_token,
    )
  } catch {
    verified = false
  }

  const { error } = await workspace.supabase
    .from("organization_domain_verifications")
    .update({
      last_checked_at: new Date().toISOString(),
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", verification.id)
    .eq("organization_id", workspace.organization.id)

  if (error) {
    domainError("We could not check the domain verification record.")
  }

  revalidatePath(domainPath)
  redirect(
    messagePath(
      domainPath,
      verified ? "success" : "error",
      verified
        ? "Organization domain verified."
        : `We could not find the TXT record at ${recordName}. DNS updates can take time to appear.`,
    ),
  )
}
