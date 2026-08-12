"use client"

import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Paperclip } from "lucide-react"
import { registerApplicationMessageAttachment } from "@/app/applications/actions"
import { Button } from "@/components/ui/button"
import { applicationMessageAttachmentsBucket, applicationMessageAttachmentMaxBytes, isApplicationMessageAttachmentMimeType } from "@/lib/applications/message-attachments"
import { createClient } from "@/lib/supabase/client"

export function MessageAttachmentUpload({ applicationId, userId }: { applicationId: string; userId: string }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [fileName, setFileName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setError("")
    setFileName(file?.name ?? "")
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const input = event.currentTarget.elements.namedItem("file"); const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined
    if (!file) return setError("Choose a file."); if (!isApplicationMessageAttachmentMimeType(file.type) || file.size > applicationMessageAttachmentMaxBytes) return setError("Use a PDF, DOCX, JPG, or PNG under 10 MB.")
    setPending(true); setError(""); const attachmentId = crypto.randomUUID(); const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180) || "attachment"; const storagePath = `${applicationId}/${userId}/${attachmentId}/${fileName}`; const supabase = createClient(); const { error: uploadError } = await supabase.storage.from(applicationMessageAttachmentsBucket).upload(storagePath, file, { contentType: file.type, upsert: false })
    if (uploadError) { setError(uploadError.message || "Upload failed."); setPending(false); return }
    const data = new FormData(); for (const [key, value] of Object.entries({ applicationId, attachmentId, storagePath, fileName, mimeType: file.type, fileSize: String(file.size) })) data.set(key, value)
    try {
      const result = await registerApplicationMessageAttachment(data)
      if (!result.ok) {
        await supabase.storage.from(applicationMessageAttachmentsBucket).remove([storagePath])
        setError(result.message)
        setPending(false)
        return
      }
      event.currentTarget.reset()
      setFileName("")
      setPending(false)
      router.refresh()
    } catch {
      await supabase.storage.from(applicationMessageAttachmentsBucket).remove([storagePath])
      setError("The attachment could not be saved.")
      setPending(false)
    }
  }
  return <form className="flex flex-wrap items-center gap-3" onSubmit={upload}>
    <input accept=".pdf,.docx,image/jpeg,image/png" className="sr-only" name="file" onChange={selectFile} ref={inputRef} type="file" />
    <Button disabled={pending} onClick={() => inputRef.current?.click()} size="sm" type="button" variant="outline"><Paperclip />{fileName ? "Change attachment" : "Choose attachment"}</Button>
    {fileName && <><span className="max-w-56 truncate text-sm text-muted-foreground">{fileName}</span><Button disabled={pending} size="sm" type="submit">{pending ? "Uploading..." : "Upload attachment"}</Button></>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </form>
}
