import { organizationNewsBucket } from "@/lib/news/constants"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from("organization_posts").select("cover_image_path").eq("id", id).eq("status", "published").eq("moderation_status", "approved").maybeSingle()
  if (!post?.cover_image_path) return new Response("Not found", { status: 404 })
  const { data, error } = await supabase.storage.from(organizationNewsBucket).createSignedUrl(post.cover_image_path, 300)
  if (error || !data?.signedUrl) return new Response("Not found", { status: 404 })

  // Keep private Storage URLs on the server. Redirecting the browser to the
  // short-lived Supabase URL makes images unreliable in protected previews.
  const image = await fetch(data.signedUrl)
  if (!image.ok || !image.body) return new Response("Not found", { status: 404 })

  return new Response(image.body, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": image.headers.get("content-type") ?? "image/jpeg",
    },
  })
}
