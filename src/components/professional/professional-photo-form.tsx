"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ImagePlus } from "lucide-react"

import { registerProfessionalPhoto } from "@/app/dashboard/profile/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  professionalPhotoMaxBytes,
  professionalPhotoMimeTypes,
  professionalPhotosBucket,
} from "@/lib/professional/constants"
import { createClient } from "@/lib/supabase/client"

export function ProfessionalPhotoForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setError("")
    setMessage("")
    const input = form.elements.namedItem("photo")
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined
    if (!file) return setError("Choose a photo to upload.")
    if (!professionalPhotoMimeTypes.some((value) => value === file.type)) {
      return setError("Photos must be JPG, PNG, or WebP.")
    }
    if (file.size < 1 || file.size > professionalPhotoMaxBytes) {
      return setError("Photos must be smaller than 5 MB.")
    }

    setPending(true)
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const storagePath = `${userId}/${crypto.randomUUID()}/profile.${extension}`
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(professionalPhotosBucket)
      .upload(storagePath, file, { cacheControl: "3600", contentType: file.type })
    if (uploadError) {
      setPending(false)
      return setError(uploadError.message || "The photo upload failed.")
    }

    const metadata = new FormData()
    metadata.set("storagePath", storagePath)
    metadata.set("mimeType", file.type)
    metadata.set("fileSize", String(file.size))
    try {
      const result = await registerProfessionalPhoto(metadata)
      if (!result.ok) {
        await supabase.storage.from(professionalPhotosBucket).remove([storagePath])
        setError(result.message)
      } else {
        setMessage(result.message)
        form.reset()
        router.refresh()
      }
    } catch {
      await supabase.storage.from(professionalPhotosBucket).remove([storagePath])
      setError("The upload could not be completed. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
      <Input accept={professionalPhotoMimeTypes.join(",")} name="photo" required type="file" />
      <p className="text-xs leading-5 text-muted-foreground">
        JPG, PNG, or WebP up to 5 MB. Your photo stays private unless you share your extended profile with organizations you apply to.
      </p>
      <Button disabled={pending} type="submit">
        <ImagePlus /> {pending ? "Uploading photo..." : "Upload photo"}
      </Button>
    </form>
  )
}
