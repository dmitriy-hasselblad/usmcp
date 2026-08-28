import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { LetterPreview } from "@/components/professional/cover-letter-editor"
import { Button } from "@/components/ui/button"
import { requireIdentity } from "@/lib/auth/session"
import { parseCoverLetterContent } from "@/lib/cover-letter/types"

type CoverLetterViewerPageProps = {
  params: Promise<{ id: string }>
}

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

export default async function ApplicationCoverLetterViewerPage({ params }: CoverLetterViewerPageProps) {
  const [{ id }, identity] = await Promise.all([
    params,
    requireIdentity("/dashboard/applications"),
  ])

  if (!isUuid(id)) notFound()

  const { data: application } = await identity.supabase
    .from("applications")
    .select("id, cover_letter_builder_id")
    .eq("id", id)
    .maybeSingle()

  if (!application?.cover_letter_builder_id) notFound()

  const { data: coverLetter } = await identity.supabase
    .from("professional_cover_letters")
    .select("title, content")
    .eq("id", application.cover_letter_builder_id)
    .maybeSingle()

  if (!coverLetter) notFound()

  return (
    <main className="min-h-dvh bg-muted/35 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Button asChild className="mb-6" variant="outline">
          <Link href={`/dashboard/applications/${id}`}>
            <ArrowLeft /> Back to application
          </Link>
        </Button>
        <p className="mb-4 text-sm text-muted-foreground">Selected cover letter: {coverLetter.title}</p>
        <LetterPreview content={parseCoverLetterContent(coverLetter.content)} />
      </div>
    </main>
  )
}
