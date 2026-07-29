"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type FormEvent } from "react"
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react"

import { registerProfessionalDocument } from "@/app/dashboard/profile/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  credentialMimeTypes,
  professionalDocumentMaxBytes,
  professionalDocumentsBucket,
  professionalDocumentTypeLabels,
  professionalDocumentTypes,
  resumeMimeTypes,
  type ProfessionalDocumentType,
} from "@/lib/professional/constants"
import { createClient } from "@/lib/supabase/client"

export function DocumentUploadForm({
  hasPrimaryResume,
  userId,
}: {
  hasPrimaryResume: boolean
  userId: string
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [documentType, setDocumentType] =
    useState<ProfessionalDocumentType>("resume")
  const [title, setTitle] = useState("")
  const [makePrimary, setMakePrimary] = useState(!hasPrimaryResume)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    const form = event.currentTarget
    const fileInput = form.elements.namedItem("file")
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined

    if (!file) {
      setError("Choose a document to upload.")
      return
    }

    const allowedMimeTypes =
      documentType === "resume" ? resumeMimeTypes : credentialMimeTypes

    if (!allowedMimeTypes.some((mimeType) => mimeType === file.type)) {
      setError(
        documentType === "resume"
          ? "Resume files must be PDF or DOCX."
          : "Credential files must be PDF, JPG, or PNG.",
      )
      return
    }

    if (file.size < 1 || file.size > professionalDocumentMaxBytes) {
      setError("Files must be smaller than 8 MB.")
      return
    }

    if (!title.trim() || title.trim().length > 120) {
      setError("Enter a document title using up to 120 characters.")
      return
    }

    setPending(true)

    const documentId = crypto.randomUUID()
    const fileName = safeStorageFileName(file.name)
    const storagePath = `${userId}/${documentId}/${fileName}`
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(professionalDocumentsBucket)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      setError(uploadError.message || "The document upload failed.")
      setPending(false)
      return
    }

    const metadata = new FormData()
    metadata.set("documentId", documentId)
    metadata.set("documentType", documentType)
    metadata.set("title", title.trim())
    metadata.set("storagePath", storagePath)
    metadata.set("fileName", fileName)
    metadata.set("mimeType", file.type)
    metadata.set("fileSize", String(file.size))
    metadata.set("makePrimary", String(documentType === "resume" && makePrimary))

    try {
      const result = await registerProfessionalDocument(metadata)

      if (!result.ok) {
        await supabase.storage
          .from(professionalDocumentsBucket)
          .remove([storagePath])
        setError(result.message)
        return
      }

      formRef.current?.reset()
      setDocumentType("resume")
      setTitle("")
      setMakePrimary(false)
      setSuccess(result.message)
      router.refresh()
    } catch {
      await supabase.storage
        .from(professionalDocumentsBucket)
        .remove([storagePath])
      setError("The upload could not be completed. Please try again.")
    } finally {
      setPending(false)
    }
  }

  function handleFileChange(file: File | undefined) {
    if (!file || title) return
    setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 120))
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} ref={formRef}>
      {error && (
        <p
          className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          <CheckCircle2 className="size-4" />
          {success}
        </p>
      )}

      <label className="grid gap-2 text-sm font-medium">
        Document type
        <select
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
          name="documentType"
          onChange={(event) => {
            const nextType = event.target.value as ProfessionalDocumentType
            setDocumentType(nextType)
            setMakePrimary(nextType === "resume" && !hasPrimaryResume)
          }}
          value={documentType}
        >
          {professionalDocumentTypes.map((type) => (
            <option key={type} value={type}>
              {professionalDocumentTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Document title
        <Input
          className="h-11"
          maxLength={120}
          name="title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder={
            documentType === "resume"
              ? "Clinical Resume 2026"
              : "Illinois professional license"
          }
          required
          value={title}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        File
        <Input
          accept={
            documentType === "resume"
              ? ".pdf,.docx"
              : ".pdf,.jpg,.jpeg,.png"
          }
          className="h-11 py-2"
          name="file"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
          required
          type="file"
        />
        <span className="text-xs font-normal leading-5 text-muted-foreground">
          {documentType === "resume"
            ? "PDF or DOCX"
            : "PDF, JPG, or PNG"}
          , up to 8 MB. Files are stored in a private bucket.
        </span>
      </label>

      {documentType === "resume" && (
        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/35 p-4 text-sm">
          <input
            checked={makePrimary}
            className="mt-0.5 size-4 accent-primary"
            onChange={(event) => setMakePrimary(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong className="block font-semibold">Use as primary resume</strong>
            <span className="mt-1 block leading-5 text-muted-foreground">
              This resume will be preselected when you apply for a job.
            </span>
          </span>
        </label>
      )}

      <Button className="h-11" disabled={pending} type="submit">
        {pending ? (
          "Uploading securely..."
        ) : (
          <>
            <Upload />
            Upload document
          </>
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
        Employers can access only the resume you attach to their job
        application. Other profile documents remain private.
      </p>
    </form>
  )
}

function safeStorageFileName(value: string) {
  const extensionMatch = value.toLowerCase().match(/\.[a-z0-9]{1,8}$/)
  const extension = extensionMatch?.[0] ?? ""
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 255)

  return /^[a-zA-Z0-9]/.test(normalized)
    ? normalized
    : `document-${Date.now()}${extension}`
}
