import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"

export const alt = "SM VIA Healthcare Salary Hub"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <SocialCard accent="teal" description="Compare healthcare salary estimates by profession and state." eyebrow="Official U.S. wage data" title="Healthcare salaries, made easier to compare." />,
    size,
  )
}
