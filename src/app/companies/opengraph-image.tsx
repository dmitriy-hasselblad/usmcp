import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"

export const alt = "Healthcare Organizations | SM VIA"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function CompaniesOpenGraphImage() {
  return new ImageResponse(
    <SocialCard
      accent="blue"
      description="Learn about healthcare employers, workplace details, and active opportunities before you apply."
      eyebrow="Healthcare organizations"
      title="Understand the workplace before you apply."
    />,
    size,
  )
}
