import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Building2, ShieldCheck } from "lucide-react"

import { submitOrganizationClaim } from "@/app/companies/[slug]/claim/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireIdentity } from "@/lib/auth/session"
import { getPublicOrganizationBySlug } from "@/lib/organizations/public-organizations"

export const metadata: Metadata = {
  title: "Claim organization profile",
  description: "Request ownership of a public healthcare organization profile.",
  robots: { index: false, follow: false },
}

type ClaimOrganizationPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string | string[]; success?: string | string[] }>
}

export default async function ClaimOrganizationPage({
  params,
  searchParams,
}: ClaimOrganizationPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const organization = await getPublicOrganizationBySlug(slug)

  if (!organization || organization.isPlatformProfile) notFound()

  const identity = await requireIdentity(`/companies/${organization.slug}/claim`)
  const [{ data: profile }, { data: latestClaim }] = await Promise.all([
    identity.supabase
      .from("profiles")
      .select("account_type, onboarding_completed")
      .eq("id", identity.userId)
      .maybeSingle(),
    identity.supabase
      .from("organization_claims")
      .select("id, status, review_note, created_at")
      .eq("organization_id", organization.id)
      .eq("claimant_id", identity.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const canClaim = profile?.account_type === "employer" && profile.onboarding_completed

  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/companies/${organization.slug}`}>← Back to {organization.name}</Link>
        </Button>

        <div className="mt-8 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Organization ownership</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Claim {organization.name}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Are you authorized to represent this organization? Submit a request and SM VIA will verify it before granting access.
            </p>
          </div>
        </div>

        <div className="mt-6"><AuthNotice error={one(query.error)} success={one(query.success)} /></div>

        {latestClaim?.status === "pending" ? (
          <StatusCard title="Your claim is under review" tone="pending">
            We received your request on {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(latestClaim.created_at))}. We will contact you when the review is complete.
          </StatusCard>
        ) : latestClaim?.status === "approved" ? (
          <StatusCard title="Your claim was approved" tone="approved">
            Your employer workspace is ready. You can now manage this organization’s profile and listings.
            <span className="mt-4 block"><Button asChild><Link href="/dashboard">Open employer workspace</Link></Button></span>
          </StatusCard>
        ) : latestClaim?.status === "rejected" ? (
          <StatusCard title="Your claim needs more information" tone="rejected">
            {latestClaim.review_note} You may submit a new request with updated information.
          </StatusCard>
        ) : null}

        {!latestClaim || latestClaim.status === "rejected" ? (
          <Card className="mt-6 bg-white">
            <CardContent className="p-6 sm:p-8">
              {!canClaim ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                  <h2 className="font-semibold">An employer account is required</h2>
                  <p className="mt-2">Complete onboarding with an employer account before requesting ownership of an organization profile.</p>
                  <Button asChild className="mt-4" variant="outline"><Link href="/onboarding">Complete onboarding</Link></Button>
                </div>
              ) : (
                <form action={submitOrganizationClaim} className="grid gap-5">
                  <input name="organizationId" type="hidden" value={organization.id} />
                  <input name="slug" type="hidden" value={organization.slug} />
                  <label className="grid gap-2 text-sm font-medium">Your title at {organization.name}<Input autoComplete="organization-title" maxLength={120} minLength={2} name="claimantTitle" placeholder="e.g. Director of Talent Acquisition" required /></label>
                  <label className="grid gap-2 text-sm font-medium">Work email address<Input autoComplete="email" defaultValue={identity.email ?? ""} maxLength={254} name="workEmail" placeholder="you@organization.org" required type="email" /></label>
                  <label className="grid gap-2 text-sm font-medium">How are you authorized to represent this organization?<Textarea maxLength={1500} minLength={20} name="relationship" placeholder="Describe your role and why you are authorized to manage this organization’s SM VIA profile." required rows={6} /><span className="text-xs font-normal leading-5 text-muted-foreground">20–1,500 characters. Do not include passwords, patient information, or other confidential data.</span></label>
                  <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-0.5 size-4" name="confirmed" required type="checkbox" />I confirm that the information is accurate and that I am authorized to represent this organization.</label>
                  <AuthSubmitButton pendingLabel="Submitting claim…">Submit ownership claim</AuthSubmitButton>
                </form>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <p>Claims are private. The public profile will not change until a platform administrator verifies your request.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function StatusCard({ children, title, tone }: { children: ReactNode; title: string; tone: "pending" | "approved" | "rejected" }) {
  const color = tone === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : tone === "rejected" ? "border-red-200 bg-red-50 text-red-950" : "border-amber-200 bg-amber-50 text-amber-950"
  return <Card className={`mt-6 ${color}`}><CardContent className="p-6"><h2 className="font-semibold">{title}</h2><div className="mt-2 text-sm leading-6">{children}</div></CardContent></Card>
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
