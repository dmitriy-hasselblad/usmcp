import { NextResponse } from "next/server"

import { organizationNewsBucket } from "@/lib/news/constants"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from("organization_posts").select("cover_image_path").eq("id", id).eq("status", "published").eq("moderation_status", "approved").maybeSingle()
  if (!post?.cover_image_path) return new Response("Not found", { status: 404 })
  const { data, error } = await supabase.storage.from(organizationNewsBucket).createSignedUrl(post.cover_image_path, 300)
  if (error || !data?.signedUrl) return new Response("Not found", { status: 404 })
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "public, max-age=300" } })
}
