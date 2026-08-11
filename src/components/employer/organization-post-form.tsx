"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { createOrganizationPost, updateOrganizationPost } from "@/app/dashboard/news/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { newsImageMaxBytes, newsImageMimeTypes, organizationNewsBucket } from "@/lib/news/constants"
import { createClient } from "@/lib/supabase/client"

type EditablePost = { id: string; title: string; excerpt: string; body: string; cover_image_path: string | null }
export function OrganizationPostForm({ organizationId, post }: { organizationId: string; post?: EditablePost }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("")
    const form = event.currentTarget
    const data = new FormData(form)
    if (post) data.set("postId", post.id)
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    data.set("intent", submitter?.value || "draft")
    const input = form.elements.namedItem("coverImage")
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined
    data.delete("coverImage")
    let storagePath = ""
    if (file) {
      if (!newsImageMimeTypes.some(type => type === file.type) || file.size > newsImageMaxBytes) { setPending(false); return setError("Cover images must be JPG, PNG, or WebP and smaller than 8 MB.") }
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
      storagePath = `${organizationId}/${crypto.randomUUID()}/cover.${extension}`
      const { error: uploadError } = await createClient().storage.from(organizationNewsBucket).upload(storagePath, file, { contentType: file.type, cacheControl: "3600" })
      if (uploadError) { setPending(false); return setError("The cover image could not be uploaded.") }
      data.set("coverImagePath", storagePath); data.set("mimeType", file.type); data.set("fileSize", String(file.size))
    }
    const result = post ? await updateOrganizationPost(data) : await createOrganizationPost(data)
    if (!result.ok) { if (storagePath) await createClient().storage.from(organizationNewsBucket).remove([storagePath]); setPending(false); return setError(result.message) }
    router.push(`/dashboard/news?success=${encodeURIComponent(result.message)}`); router.refresh()
  }
  return <form className="grid gap-5" onSubmit={submit}>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <label className="grid gap-2 text-sm font-medium">Headline<Input defaultValue={post?.title} name="title" minLength={5} maxLength={180} required /></label>
    <label className="grid gap-2 text-sm font-medium">Short summary<Textarea defaultValue={post?.excerpt} name="excerpt" minLength={20} maxLength={360} rows={3} required /></label>
    <label className="grid gap-2 text-sm font-medium">Article<Textarea defaultValue={post?.body} name="body" minLength={100} maxLength={30000} rows={14} required /></label>
    <label className="grid gap-2 text-sm font-medium">Cover image <span className="text-xs font-normal text-muted-foreground">Optional JPG, PNG, or WebP up to 8 MB.</span><Input accept={newsImageMimeTypes.join(",")} name="coverImage" type="file" /></label>
    {post?.cover_image_path && <p className="text-xs text-muted-foreground">The current cover image will remain unless you upload a replacement.</p>}
    {post?.cover_image_path && <label className="flex items-center gap-2 text-sm text-muted-foreground"><input name="removeCoverImage" type="checkbox" /> Remove the current cover image</label>}
    <p className="text-sm text-muted-foreground">Published articles appear publicly right away. Platform review is only used when a report is made.</p>
    <div className="flex flex-wrap gap-3"><Button disabled={pending} name="intent" value="draft" variant="outline">{pending ? "Saving..." : "Save draft"}</Button><Button disabled={pending} name="intent" value="publish">{pending ? "Publishing..." : post ? "Save changes and publish" : "Publish article"}</Button></div>
  </form>
}
