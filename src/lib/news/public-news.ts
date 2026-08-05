import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

const selection = "id, slug, title, excerpt, body, cover_image_path, published_at, organizations(name, slug, organization_type, state_code)"
export const getPublishedOrganizationPosts = cache(async () => {
  const { data } = await (await createClient()).from("organization_posts").select(selection).eq("status", "published").eq("moderation_status", "approved").order("published_at", { ascending: false }).limit(60)
  return data ?? []
})
export const getPublishedOrganizationPost = cache(async (slug: string) => {
  const { data } = await (await createClient()).from("organization_posts").select(selection).eq("slug", slug).eq("status", "published").eq("moderation_status", "approved").maybeSingle()
  return data
})
