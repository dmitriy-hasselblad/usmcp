import { AccessToken } from "livekit-server-sdk"

const requiredVideoVariables = ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"] as const

export function isLiveKitConfigured() {
  return requiredVideoVariables.every((name) => Boolean(process.env[name]?.trim()))
}

export async function createInterviewVideoToken({
  interviewId,
  userId,
  name,
}: {
  interviewId: string
  userId: string
  name: string
}) {
  const url = process.env.LIVEKIT_URL?.trim()
  const apiKey = process.env.LIVEKIT_API_KEY?.trim()
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim()

  if (!url || !apiKey || !apiSecret) return null

  const token = new AccessToken(apiKey, apiSecret, {
    identity: `ushce-${userId}`,
    name,
    ttl: "10m",
  })
  token.addGrant({ room: `ushce-interview-${interviewId}`, roomJoin: true, canPublish: true, canSubscribe: true })

  return { token: await token.toJwt(), url, roomName: `ushce-interview-${interviewId}` }
}
