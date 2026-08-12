import { createClient } from "@/lib/supabase/server"

export async function getUnreadNotificationCount() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (typeof userId !== "string") return 0

  const { count } = await supabase
    .from("user_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)

  return count ?? 0
}
