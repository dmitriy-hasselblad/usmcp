import { NextResponse } from "next/server"

import { requireIdentity } from "@/lib/auth/session"
import { professionalDocumentsBucket } from "@/lib/professional/constants"

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 })
  }

  const identity = await requireIdentity(
    `/dashboard/documents/${id}/download`,
  )
  const { data: document } = await identity.supabase
    .from("professional_documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle()

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 })
  }

  const { data, error } = await identity.supabase.storage
    .from(professionalDocumentsBucket)
    .createSignedUrl(document.storage_path, 60, {
      download: true,
    })

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "The document is temporarily unavailable." },
      { status: 503 },
    )
  }

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store",
      Location: data.signedUrl,
    },
  })
}
