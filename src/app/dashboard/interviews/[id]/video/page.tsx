import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Video } from "lucide-react"
import { notFound } from "next/navigation"

import { InterviewVideoRoom } from "@/components/interviews/interview-video-room"
import { Button } from "@/components/ui/button"
import { requireIdentity } from "@/lib/auth/session"
import { createInterviewVideoToken, isLiveKitConfigured } from "@/lib/interviews/video"

export const metadata: Metadata = { title: "Video interview" }

export default async function InterviewVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, identity] = await Promise.all([params, requireIdentity("/dashboard")])
  const { data: interview } = await identity.supabase
    .from("application_interviews")
    .select("id, application_id, status")
    .eq("id", id)
    .maybeSingle()

  if (!interview || interview.status !== "confirmed") notFound()

  const { error: startError } = await identity.supabase.rpc("start_application_interview_video", {
    target_interview_id: interview.id,
  })
  if (startError) notFound()

  const backUrl = `/dashboard/applications/${interview.application_id}`
  const video = await createInterviewVideoToken({
    interviewId: interview.id,
    userId: identity.userId,
    name: identity.email ?? "SMVIA participant",
  })

  return <main className="min-h-screen bg-muted/40 p-4 sm:p-8">
    <div className="mx-auto max-w-6xl">
      <Button asChild size="sm" variant="outline"><Link href={backUrl}><ArrowLeft />Back to application</Link></Button>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Video className="size-5" /></span><div><h1 className="text-2xl font-semibold">Video interview</h1><p className="mt-1 text-sm text-muted-foreground">This private room is available only to confirmed interview participants.</p></div></div>
        {video ? <div className="mt-6 overflow-hidden rounded-xl border p-3"><InterviewVideoRoom backUrl={backUrl} interviewId={interview.id} token={video.token} url={video.url} /></div> : <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-semibold text-amber-950">Video interviews are not connected yet</h2><p className="mt-2 text-sm leading-6 text-amber-900">A platform administrator must add the LiveKit project settings in Vercel before this private video room can start.</p></div>}
      </div>
    </div>
  </main>
}
