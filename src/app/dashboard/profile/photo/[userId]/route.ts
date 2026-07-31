import { NextResponse } from "next/server"

import { requireIdentity } from "@/lib/auth/session"
import { professionalPhotosBucket } from "@/lib/professional/constants"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params
  if (!uuidPattern.test(userId)) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 })
  }
  const identity = await requireIdentity(`/dashboard/profile/photo/${userId}`)
  const { data: profile } = await identity.supabase
    .from("professional_profiles")
    .select("photo_path")
    .eq("user_id", userId)
    .maybeSingle()
  if (!profile?.photo_path) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 })
  }
  const { data, error } = await identity.supabase.storage
    .from(professionalPhotosBucket)
    .createSignedUrl(profile.photo_path, 60)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "The photo is temporarily unavailable." }, { status: 503 })
  }
  return new Response(null, {
    status: 302,
    headers: { "Cache-Control": "private, no-store", Location: data.signedUrl },
  })
}
