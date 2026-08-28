"use client"

import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Upload } from "lucide-react"

import { registerProfessionalDocument } from "@/app/dashboard/profile/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  professionalDocumentMaxBytes,
  professionalDocumentsBucket,
  resumeMimeTypes,
} from "@/lib/professional/constants"
import { createClient } from "@/lib/supabase/client"

export function CoverLetterUpload({ userId }: { userId: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [title, setTitle] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    const form = event.currentTarget
    const input = form.elements.namedItem("file")
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined

    if (!file) return setError("Choose a PDF or DOCX cover letter to upload.")
    if (!resumeMimeTypes.includes(file.type as (typeof resumeMimeTypes)[number])) {
      return setError("Cover letters must be PDF or DOCX files.")
    }
    if (file.size < 1 || file.size > professionalDocumentMaxBytes) {
      return setError("Files must be smaller than 8 MB.")
    }
    if (!title.trim() || title.trim().length > 120) {
      return setError("Enter a title using up to 120 characters.")
    }

    setPending(true)
    const documentId = crypto.randomUUID()
    const fileName = safeStorageFileName(file.name)
    const storagePath = `${userId}/${documentId}/${fileName}`
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(professionalDocumentsBucket)
      .upload(storagePath, file, { cacheControl: "3600", contentType: file.type, upsert: false })

    if (uploadError) {
      setError(uploadError.message || "The cover letter upload failed.")
      setPending(false)
      return
    }

    const metadata = new FormData()
    metadata.set("documentId", documentId)
    metadata.set("documentType", "cover_letter")
    metadata.set("title", title.trim())
    metadata.set("storagePath", storagePath)
    metadata.set("fileName", fileName)
    metadata.set("mimeType", file.type)
    metadata.set("fileSize", String(file.size))
    metadata.set("makePrimary", "false")

    try {
      const result = await registerProfessionalDocument(metadata)
      if (!result.ok) {
        await supabase.storage.from(professionalDocumentsBucket).remove([storagePath])
        setError(result.message)
        return
      }
      formRef.current?.reset()
      setTitle("")
      setSuccess("Cover letter uploaded securely.")
      router.refresh()
    } catch {
      await supabase.storage.from(professionalDocumentsBucket).remove([storagePath])
      setError("The cover letter could not be uploaded. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return <form className="grid gap-4" onSubmit={upload} ref={formRef}>
    {error && <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
    {success && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status"><CheckCircle2 className="size-4" />{success}</p>}
    <label className="grid gap-2 text-sm font-medium">Letter title<Input className="h-11" maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="General surgery cover letter" required value={title} /></label>
    <label className="grid gap-2 text-sm font-medium">Finished cover letter<Input accept=".pdf,.docx" className="h-11 py-2" name="file" onChange={(event) => { const file = event.target.files?.[0]; if (file && !title) setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 120)) }} required type="file" /><span className="text-xs font-normal leading-5 text-muted-foreground">PDF or DOCX, up to 8 MB. Uploaded letters stay private and can be downloaded or removed here.</span></label>
    <Button className="h-11" disabled={pending} type="submit">{pending ? "Uploading securely..." : <><Upload />Upload cover letter</>}</Button>
  </form>
}

function safeStorageFileName(value: string) {
  const extension = value.toLowerCase().match(/\.[a-z0-9]{1,8}$/)?.[0] ?? ""
  const normalized = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "").slice(0, 255)
  return /^[a-zA-Z0-9]/.test(normalized) ? normalized : `cover-letter-${Date.now()}${extension}`
}
