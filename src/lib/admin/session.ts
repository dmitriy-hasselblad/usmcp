import { notFound } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"

export async function requirePlatformAdmin(nextPath = "/admin") {
  const identity = await requireIdentity(nextPath)
  const { data: access, error } = await identity.supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", identity.userId)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !access) {
    notFound()
  }

  return identity
}

