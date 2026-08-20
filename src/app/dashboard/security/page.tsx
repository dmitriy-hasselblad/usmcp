import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { MfaSecuritySettings } from "@/components/auth/mfa-security-settings"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = { title: "Security", description: "Manage two-step verification for your SM VIA account." }

export default async function SecurityPage() {
  const identity = await requireIdentity("/dashboard/security")
  const { data: profile } = await identity.supabase.from("profiles").select("account_type, onboarding_completed").eq("id", identity.userId).single()
  if (!profile?.onboarding_completed) redirect("/onboarding")

  const content = <><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Account protection</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Security</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Two-step verification is optional, but recommended for every SM VIA account.</p></div><Card className="mt-8 bg-white"><CardContent className="p-6 sm:p-8"><MfaSecuritySettings /></CardContent></Card></>

  if (profile.account_type === "employer") {
    const workspace = await requireEmployerWorkspace("/dashboard/security")
    return <EmployerDashboardShell active="security" email={workspace.email} organizationName={workspace.organization.name}><EmployerPageHeader description="Add another layer of protection to your organization workspace." eyebrow="Account protection" title="Security" /><div className="mt-8"><Card className="bg-white"><CardContent className="p-6 sm:p-8"><MfaSecuritySettings /></CardContent></Card></div></EmployerDashboardShell>
  }

  return <ProfessionalDashboardShell active="security" email={identity.email}>{content}</ProfessionalDashboardShell>
}
