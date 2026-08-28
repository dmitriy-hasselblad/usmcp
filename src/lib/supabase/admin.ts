import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabaseCredentials } from "@/lib/supabase/env"

/**
 * Server-only client for background tasks that need to read a user's email
 * without exposing it to another signed-in user.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return null

  const { url } = getSupabaseCredentials()
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
