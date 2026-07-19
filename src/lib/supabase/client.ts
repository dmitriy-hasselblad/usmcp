import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseCredentials } from "@/lib/supabase/env"

export function createClient() {
  const { url, publishableKey } = getSupabaseCredentials()

  return createBrowserClient(url, publishableKey)
}
