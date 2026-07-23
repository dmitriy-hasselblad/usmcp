import type { Metadata } from "next"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { updateOrganization } from "@/app/dashboard/actions"
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
