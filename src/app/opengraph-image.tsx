import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"

export const alt = "SM VIA | The U.S. Healthcare Career Ecosystem"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <SocialCard
      accent="blue"
      description="Meaningful opportunities, trusted organizations, and practical career guidance for U.S. healthcare professionals."
      eyebrow="The U.S. healthcare career ecosystem"
      title="Build your healthcare career with clarity."
    />,
    size,
  )
}
