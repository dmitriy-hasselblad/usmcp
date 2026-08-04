import { redirect } from "next/navigation"

import { isSafeInternalPath } from "@/lib/auth/validation"
import { isAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function requireIdentity(nextPath = "/dashboard") {
  if (!isAuthEnabled()) {
    redirect(
      "/sign-in?error=Authentication%20is%20not%20configured%20for%20this%20deployment.",
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  const userId = claims?.sub

  if (error || !userId) {
    const next = isSafeInternalPath(nextPath) ? nextPath : "/dashboard"
    redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  const { data: accountStatus, error: accountStatusError } = await supabase.rpc(
    "get_current_account_status",
  )
  if (accountStatusError) redirect("/sign-in?error=Account%20status%20could%20not%20be%20verified.")
  if (accountStatus === "suspended") redirect("/account-suspended")

  return {
    supabase,
    userId,
    email: typeof claims?.email === "string" ? claims.email : undefined,
  }
}
