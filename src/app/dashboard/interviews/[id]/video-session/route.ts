import { NextResponse } from "next/server"

import { requireIdentity } from "@/lib/auth/session"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, identity] = await Promise.all([params, requireIdentity("/dashboard")])
  const { error } = await identity.supabase.rpc("end_application_interview_video", {
    target_interview_id: id,
  })

  if (error) {
    return NextResponse.json({ error: "Video interview could not be ended." }, { status: 403 })
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "private, no-store" } })
}
