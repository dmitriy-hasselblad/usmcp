import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { changeOrganizationVerification, permanentlyDeleteOrganization } from "@/app/admin/organizations/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatAdminDate } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = {
  title: "Organization review | Platform administration",
  description: "Review an employer organization and its verification state.",
}

type OrganizationReviewPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    error?: string | string[]
    success?: string | string[]
  }>
}

export default async function OrganizationReviewPage({
  params,
  searchParams,
}: OrganizationReviewPageProps) {
  const [identity, { id }, query] = await Promise.all([
    requirePlatformAdmin(),
    params,
    searchParams,
  ])

  const [
    { data: organization, error: organizationError },
    { count: jobs },
    { count: applications },
  ] = await Promise.all([
    identity.supabase
      .from("organizations")
      .select(
        "id, name, slug, organization_type, state_code, description, website, verification_status, created_at, updated_at",
      )
      .eq("id", id)
      .maybeSingle(),
    identity.supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", id),
    identity.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", id),
  ])

  if (organizationError || !organization) notFound()

  return (
    <AdminShell active="organizations" email={identity.email}>
      <Button asChild size="sm" variant="ghost">
        <Link href="/admin/organizations">
          <ArrowLeft /> Back to organizations
        </Link>
      </Button>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Organization review
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
            {organization.name}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {organization.organization_type} · {organization.state_code}
          </p>
        </div>
        <VerificationBadge status={organization.verification_status} />
      </div>

      <div className="mt-6">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_23rem]">
        <div className="grid content-start gap-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Organization details</h2>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/companies/${organization.slug}`}>
                    Public profile <ExternalLink />
                  </Link>
                </Button>
              </div>
              <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
                <Detail label="Organization type" value={organization.organization_type} />
                <Detail label="Primary state" value={organization.state_code} />
                <Detail label="Created" value={formatAdminDate(organization.created_at)} />
                <Detail label="Last updated" value={formatAdminDate(organization.updated_at)} />
                <Detail label="Website" value={organization.website ?? "Not provided"} />
                <Detail label="Public slug" value={organization.slug} />
              </dl>
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                  {organization.description || "No organization description has been provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Metric icon={BriefcaseBusiness} label="Jobs" value={jobs ?? 0} />
            <Metric icon={FileText} label="Applications" value={applications ?? 0} />
          </div>
        </div>

        <div className="grid content-start gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">Verification decision</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Every decision records your account, the organization, the status change, and the timestamp.
            </p>
            <div className="mt-6 grid gap-5">
              {organization.verification_status !== "verified" && (
                <ModerationForm
                  organizationId={organization.id}
                  submitLabel="Verify organization"
                  targetStatus="verified"
                />
              )}
              {organization.verification_status !== "pending" && (
                <ModerationForm
                  organizationId={organization.id}
                  submitLabel="Move to pending review"
                  targetStatus="pending"
                />
              )}
              {organization.verification_status !== "rejected" && (
                <ModerationForm
                  organizationId={organization.id}
                  rejection
                  submitLabel="Reject verification"
                  targetStatus="rejected"
                />
              )}
            </div>
          </CardContent>
        </Card>
        <DeleteOrganizationForm organizationId={organization.id} />
        </div>
      </div>
    </AdminShell>
  )
}

function ModerationForm({
  organizationId,
  rejection = false,
  submitLabel,
  targetStatus,
}: {
  organizationId: string
  rejection?: boolean
  submitLabel: string
  targetStatus: "pending" | "verified" | "rejected"
}) {
  return (
    <form action={changeOrganizationVerification} className="rounded-xl border border-border p-4">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="targetStatus" type="hidden" value={targetStatus} />
      <label className="grid gap-2 text-sm font-medium">
        Moderation note {rejection ? "(required)" : "(optional)"}
        <Textarea
          maxLength={1000}
          minLength={rejection ? 10 : undefined}
          name="moderationReason"
          placeholder={rejection ? "Explain why verification is being rejected." : "Add internal context for this decision."}
          required={rejection}
          rows={3}
        />
      </label>
      <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input className="mt-1 size-4" name="confirmed" required type="checkbox" />
        I confirm this moderation decision and understand it will be recorded in the audit log.
      </label>
      <Button
        className="mt-4 w-full"
        type="submit"
        variant={rejection ? "destructive" : "outline"}
      >
        {submitLabel}
      </Button>
    </form>
  )
}

function DeleteOrganizationForm({ organizationId }: { organizationId: string }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6">
        <Trash2 className="size-6 text-red-700" />
        <h2 className="mt-4 text-lg font-semibold text-red-950">Permanent removal</h2>
        <p className="mt-2 text-sm leading-6 text-red-900">This permanently removes the organization and its empty jobs, team memberships, invitations, and posts. Organizations with applications are protected and cannot be removed.</p>
        <form action={permanentlyDeleteOrganization} className="mt-5">
          <input name="organizationId" type="hidden" value={organizationId} />
          <label className="grid gap-2 text-sm font-medium text-red-950">Type DELETE to confirm<Input autoComplete="off" name="confirmation" required /></label>
          <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-900"><input className="mt-1 size-4" name="confirmed" required type="checkbox" />I understand this cannot be undone.</label>
          <Button className="mt-4 w-full" type="submit" variant="destructive"><Trash2 /> Delete organization permanently</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function VerificationBadge({ status }: { status: string }) {
  const className = status === "verified"
    ? "bg-emerald-100 text-emerald-800"
    : status === "pending"
      ? "bg-amber-100 text-amber-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-700"
  return <Badge className={className} variant="secondary">{status}</Badge>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return <Card className="bg-white"><CardContent className="p-5"><Icon className="size-5 text-primary" /><p className="mt-4 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></CardContent></Card>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
