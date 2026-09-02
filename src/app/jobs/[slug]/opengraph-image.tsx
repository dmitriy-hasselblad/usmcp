import { ImageResponse } from "next/og"

import { SocialCard } from "@/components/seo/social-card"
import { getPublishedJobBySlug } from "@/lib/jobs/public-jobs"

export const alt = "Healthcare opportunity on SM VIA"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "nodejs"

export default async function JobOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getPublishedJobBySlug(slug)

  if (!job) {
    return new ImageResponse(
      <SocialCard
        accent="teal"
        description="Explore current U.S. healthcare opportunities on SM VIA."
        eyebrow="Healthcare opportunity"
        title="Explore healthcare opportunities."
      />,
      size,
    )
  }

  return new ImageResponse(
    <SocialCard
      accent="teal"
      description={`${job.employer} · ${job.location}`}
      detail={`${job.type} · ${job.setting}`}
      eyebrow="Live healthcare opportunity"
      title={job.title}
    />,
    size,
  )
}
