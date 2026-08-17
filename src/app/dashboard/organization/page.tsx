import type { Metadata } from "next"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { updateOrganization } from "@/app/dashboard/actions"
import {
  checkOrganizationDomainVerification,
  startOrganizationDomainVerification,
} from "@/app/dashboard/organization/domain-actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { organizationTypes, usStates } from "@/lib/auth/validation"
import {
  canManageOrganization,
  type OrganizationMemberRole,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Organization",
  description: "Manage your USHCE employer organization profile.",
}

type SearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
}>

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [workspace, params] = await Promise.all([
    requireEmployerWorkspace("/dashboard/organization"),
    searchParams,
  ])
  const canEdit = canManageOrganization(workspace.membership.role)
  const { data: domainVerification } = canEdit
    ? await workspace.supabase
        .from("organization_domain_verifications")
        .select("domain, verification_token, verified_at, last_checked_at")
        .eq("organization_id", workspace.organization.id)
        .maybeSingle()
    : { data: null }

  return (
    <EmployerDashboardShell
      active="organization"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        description="Keep the information candidates and future team members will see accurate and complete."
        eyebrow="Workspace settings"
        title="Organization profile"
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card className="bg-white">
          <CardContent className="p-6">
            <AuthNotice
              error={firstValue(params.error)}
              success={firstValue(params.success)}
            />
            <form action={updateOrganization} className="mt-1 grid gap-5">
              <label className="grid gap-2 text-sm font-medium">
                Organization name
                <Input
                  className="h-11"
                  defaultValue={workspace.organization.name}
                  disabled={!canEdit}
                  maxLength={160}
                  minLength={2}
                  name="name"
                  required
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Organization type
                  <select
                    className={selectClassName}
                    defaultValue={workspace.organization.organization_type}
                    disabled={!canEdit}
                    name="organizationType"
                    required
                  >
                    {organizationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Primary U.S. state
                  <select
                    className={selectClassName}
                    defaultValue={workspace.organization.state_code}
                    disabled={!canEdit}
                    name="stateCode"
                    required
                  >
                    {usStates.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Website
                <Input
                  className="h-11"
                  defaultValue={workspace.organization.website ?? ""}
                  disabled={!canEdit}
                  maxLength={300}
                  name="website"
                  placeholder="https://www.example.org"
                  type="url"
                />
              </label>

              <div className="rounded-xl border border-border p-4">
                <h2 className="font-semibold">Public contact details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Optional. These details appear on your public News articles.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">Public email<Input className="h-11" defaultValue={workspace.organization.public_email ?? ""} disabled={!canEdit} maxLength={254} name="publicEmail" type="email" /></label>
                  <label className="grid gap-2 text-sm font-medium">Public phone<Input className="h-11" defaultValue={workspace.organization.public_phone ?? ""} disabled={!canEdit} maxLength={30} name="publicPhone" type="tel" /></label>
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Street address<Input className="h-11" defaultValue={workspace.organization.address_line1 ?? ""} disabled={!canEdit} maxLength={160} name="addressLine1" /></label>
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Address line 2 <span className="font-normal text-muted-foreground">Optional</span><Input className="h-11" defaultValue={workspace.organization.address_line2 ?? ""} disabled={!canEdit} maxLength={160} name="addressLine2" /></label>
                  <label className="grid gap-2 text-sm font-medium">City<Input className="h-11" defaultValue={workspace.organization.city ?? ""} disabled={!canEdit} maxLength={120} name="city" /></label>
                  <label className="grid gap-2 text-sm font-medium">ZIP code<Input className="h-11" defaultValue={workspace.organization.postal_code ?? ""} disabled={!canEdit} maxLength={20} name="postalCode" /></label>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                About the organization
                <Textarea
                  defaultValue={workspace.organization.description ?? ""}
                  disabled={!canEdit}
                  maxLength={2000}
                  name="description"
                  placeholder="Describe your mission, care settings, and what makes your organization a strong place to build a healthcare career."
                  rows={7}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Up to 2,000 characters.
                </span>
              </label>

              {canEdit ? (
                <AuthSubmitButton pendingLabel="Saving changes...">
                  Save changes
                </AuthSubmitButton>
              ) : (
                <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  Your role has view-only access to organization settings.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <ShieldCheck className="size-5" />
                </span>
                <VerificationBadge
                  status={workspace.organization.verification_status}
                />
              </div>
              <h2 className="mt-4 font-semibold">Verification</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Employer verification will be introduced before public job
                publishing is enabled.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Domain verification
              </p>
              <h2 className="mt-3 font-semibold">
                {domainVerification?.verified_at
                  ? "Domain confirmed"
                  : "Confirm your organization domain"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {domainVerification?.verified_at
                  ? `USHCE found the required DNS record for ${domainVerification.domain}. This complements, but does not replace, platform verification.`
                  : "Add a DNS TXT record to prove that your organization controls its public domain. This complements, but does not replace, platform verification."}
              </p>

              {canEdit ? (
                domainVerification ? (
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5 break-all">
                      <p className="font-semibold text-foreground">TXT host</p>
                      <code>{verificationRecordName(domainVerification.domain)}</code>
                      <p className="mt-3 font-semibold text-foreground">TXT value</p>
                      <code>{domainVerification.verification_token}</code>
                    </div>
                    {domainVerification.verified_at ? (
                      <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-800" variant="outline">
                        <CheckCircle2 /> Domain confirmed
                      </Badge>
                    ) : (
                      <form action={checkOrganizationDomainVerification}>
                        <AuthSubmitButton pendingLabel="Checking DNS...">
                          Check verification
                        </AuthSubmitButton>
                      </form>
                    )}
                    <details className="text-xs leading-5 text-muted-foreground">
                      <summary className="cursor-pointer font-medium text-foreground">Use a different domain</summary>
                      <DomainStartForm defaultDomain={domainVerification.domain} />
                    </details>
                  </div>
                ) : (
                  <DomainStartForm />
                )
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Only organization owners and admins can manage domain verification.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Your access
              </p>
              <p className="mt-3 text-lg font-semibold capitalize">
                {workspace.membership.role}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {roleDescription(workspace.membership.role)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerDashboardShell>
  )
}

function verificationRecordName(domain: string) {
  return `_ushce-verification.${domain}`
}

function DomainStartForm({ defaultDomain = "" }: { defaultDomain?: string }) {
  return (
    <form action={startOrganizationDomainVerification} className="mt-4 grid gap-3">
      <label className="grid gap-2 text-sm font-medium">
        Organization domain
        <Input
          className="h-10"
          defaultValue={defaultDomain}
          maxLength={253}
          name="domain"
          placeholder="example.org"
          required
        />
      </label>
      <AuthSubmitButton pendingLabel="Creating DNS record...">
        {defaultDomain ? "Create a new DNS record" : "Start domain verification"}
      </AuthSubmitButton>
    </form>
  )
}

function VerificationBadge({ status }: { status: string }) {
  const verified = status === "verified"
  return (
    <Badge
      className={
        verified
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }
      variant="outline"
    >
      {verified && <CheckCircle2 />}
      <span className="capitalize">{status}</span>
    </Badge>
  )
}

function roleDescription(role: OrganizationMemberRole) {
  if (role === "owner") return "Full organization and hiring access."
  if (role === "admin") return "Organization and hiring management access."
  if (role === "recruiter") return "Hiring management access."
  return "View-only workspace access."
}
