"use client"

import { LiveKitRoom, VideoConference } from "@livekit/components-react"

export function InterviewVideoRoom({ token, url }: { token: string; url: string }) {
  return <LiveKitRoom audio data-lk-theme="default" serverUrl={url} token={token} video>
    <VideoConference />
  </LiveKitRoom>
}
