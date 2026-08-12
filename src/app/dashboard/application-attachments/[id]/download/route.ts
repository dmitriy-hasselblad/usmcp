import { NextResponse } from "next/server"
import { requireIdentity } from "@/lib/auth/session"
import { applicationMessageAttachmentsBucket } from "@/lib/applications/message-attachments"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Attachment not found." }, { status: 404 })
  const identity = await requireIdentity(`/dashboard/application-attachments/${id}/download`)
  const { data: attachment } = await identity.supabase.from("application_message_attachments").select("storage_path, file_name").eq("id", id).maybeSingle()
  if (!attachment) return NextResponse.json({ error: "Attachment not found." }, { status: 404 })
  const { data, error } = await identity.supabase.storage.from(applicationMessageAttachmentsBucket).createSignedUrl(attachment.storage_path, 60, { download: attachment.file_name })
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Attachment is temporarily unavailable." }, { status: 503 })
  return new Response(null, { status: 302, headers: { "Cache-Control": "private, no-store", Location: data.signedUrl } })
}
