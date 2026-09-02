import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"

export const alt = "Healthcare Jobs | SM VIA"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function JobsOpenGraphImage() {
  return new ImageResponse(
    <SocialCard
      accent="teal"
      description="Search focused healthcare opportunities by profession, specialty, location, work setting, experience, and compensation."
      eyebrow="Healthcare opportunities"
      title="Find work that fits your healthcare career."
    />,
    size,
  )
}
