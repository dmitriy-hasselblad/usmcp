"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ImagePlus } from "lucide-react"

import { registerOrganizationLogo } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  organizationLogoMaxBytes,
  organizationLogoMimeTypes,
  organizationLogosBucket,
} from "@/lib/employer/organization-logo"
import { createClient } from "@/lib/supabase/client"

export function OrganizationLogoForm({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem("logo")
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined
    setError("")
    setMessage("")
    if (!file) return setError("Choose a logo to upload.")
    if (!organizationLogoMimeTypes.some((type) => type === file.type)) return setError("Logos must be JPG, PNG, or WebP.")
    if (file.size < 1 || file.size > organizationLogoMaxBytes) return setError("Logos must be smaller than 3 MB.")

    setPending(true)
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const path = `${organizationId}/${crypto.randomUUID()}/logo.${extension}`
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(organizationLogosBucket)
      .upload(path, file, { cacheControl: "3600", contentType: file.type })
    if (uploadError) {
      setPending(false)
      return setError(uploadError.message || "The logo upload failed.")
    }
    const data = new FormData()
    data.set("storagePath", path)
    data.set("mimeType", file.type)
    data.set("fileSize", String(file.size))
    try {
      const result = await registerOrganizationLogo(data)
      if (!result.ok) {
        await supabase.storage.from(organizationLogosBucket).remove([path])
        setError(result.message)
      } else {
        form.reset()
        setMessage(result.message)
        router.refresh()
      }
    } catch {
      await supabase.storage.from(organizationLogosBucket).remove([path])
      setError("The logo could not be saved. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return <form className="grid gap-3" onSubmit={submit}>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
    <Input accept={organizationLogoMimeTypes.join(",")} name="logo" required type="file" />
    <p className="text-xs leading-5 text-muted-foreground">JPG, PNG, or WebP up to 3 MB. This public logo appears with your organization.</p>
    <Button disabled={pending} type="submit" variant="outline"><ImagePlus /> {pending ? "Uploading logo..." : "Upload logo"}</Button>
  </form>
}
