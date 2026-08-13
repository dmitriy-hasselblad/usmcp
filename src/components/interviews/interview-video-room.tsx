"use client"

import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

export function InterviewVideoRoom({
  token,
  url,
  interviewId,
  backUrl,
}: {
  token: string
  url: string
  interviewId: string
  backUrl: string
}) {
  const router = useRouter()
  const [isEnding, setIsEnding] = useState(false)
  const hasRecordedDisconnect = useRef(false)

  const recordDisconnect = () => {
    if (hasRecordedDisconnect.current) return Promise.resolve()
    hasRecordedDisconnect.current = true

    return fetch(`/dashboard/interviews/${interviewId}/video-session`, {
      method: "POST",
      keepalive: true,
    }).then(() => undefined)
  }

  useEffect(() => {
    const handlePageExit = () => recordDisconnect()

    window.addEventListener("pagehide", handlePageExit)
    return () => {
      window.removeEventListener("pagehide", handlePageExit)
    }
  }, [])

  async function endInterview() {
    setIsEnding(true)
    await recordDisconnect()
    router.push(backUrl)
    router.refresh()
  }

  return <div className="grid gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>After you leave or lose connection, this room can be reopened for 5 minutes. It then closes automatically.</p>
      <Button disabled={isEnding} onClick={endInterview} size="sm" type="button" variant="outline">{isEnding ? "Ending…" : "End interview"}</Button>
    </div>
    <div className="h-[min(68vh,44rem)] overflow-hidden rounded-xl border">
      <LiveKitRoom audio className="h-full" data-lk-theme="default" onDisconnected={recordDisconnect} serverUrl={url} token={token} video>
        <VideoConference />
      </LiveKitRoom>
    </div>
  </div>
}
