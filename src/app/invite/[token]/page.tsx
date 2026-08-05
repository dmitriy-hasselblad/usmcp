import type { Metadata } from "next"

import { acceptTeamInvitation } from "@/app/dashboard/team/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { requireIdentity } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Accept Team Invitation" }

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string | string[] }> }) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  await requireIdentity(`/invite/${token}`)
  const error = Array.isArray(query.error) ? query.error[0] : query.error
  return <AuthPageShell eyebrow="Employer workspace" title="Accept team invitation" description="Join the organization that invited you. Your signed-in email must match the invitation." footer={null}>
    <AuthNotice error={error} />
    <form action={acceptTeamInvitation}><input type="hidden" name="token" value={token}/><AuthSubmitButton pendingLabel="Accepting invitation...">Accept invitation</AuthSubmitButton></form>
  </AuthPageShell>
}
