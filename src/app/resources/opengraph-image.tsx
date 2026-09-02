import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"

export const alt = "Healthcare Career Resources | SM VIA"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function ResourcesOpenGraphImage() {
  return new ImageResponse(
    <SocialCard
      accent="teal"
      description="Clear, U.S.-focused guidance for healthcare professionals, residency candidates, and international applicants."
      eyebrow="Career resources"
      title="Practical guidance for healthcare career decisions."
    />,
    size,
  )
}
