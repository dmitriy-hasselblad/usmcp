import Link from "next/link"
import { redirect } from "next/navigation"

import { MfaChallenge } from "@/components/auth/mfa-challenge"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { isSafeInternalPath } from "@/lib/auth/validation"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Two-step verification",
  description: "Confirm your SM VIA authenticator code.",
}

type SearchParams = Promise<{ next?: string | string[] }>

export default async function MfaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next
  const nextPath = requestedNext && isSafeInternalPath(requestedNext) ? requestedNext : "/dashboard"
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`)
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (assurance?.currentLevel === "aal2") redirect(nextPath)

  return <AuthPageShell description="Open your authenticator app and enter the current code to continue." eyebrow="Extra account protection" footer={<p>Can’t access your authenticator? <Link className="font-semibold text-primary hover:underline" href="/contact">Contact support</Link></p>} title="Confirm it’s you"><MfaChallenge nextPath={nextPath} /></AuthPageShell>
}
