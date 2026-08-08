import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ReportContentLink } from "@/components/moderation/report-content-link"
import { Badge } from "@/components/ui/badge"
import {
  formatNewsDate,
  getPublishedOrganizationPost,
} from "@/lib/news/public-news"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedOrganizationPost((await params).slug)

  if (!post) {
    return { title: "Article not found" }
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/news/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
    },
  }
}

export default async function PublicNewsDetailPage({ params }: Props) {
  const post = await getPublishedOrganizationPost((await params).slug); if (!post) notFound()
  const organization = post.organizations?.[0]
  return <div className="min-h-dvh bg-white"><SiteHeader/><main><article className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16"><Link href="/news" className="text-sm font-semibold text-primary hover:underline">← Back to News & insights</Link><Badge className="mt-8" variant="outline">Organization insight</Badge><h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{post.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>Published {formatNewsDate(post.published_at)}</span>{organization && <><span aria-hidden="true">·</span><span>By <Link className="font-semibold text-primary hover:underline" href={`/companies/${organization.slug}`}>{organization.name}</Link></span></>}</div>{post.cover_image_path && <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl"><Image alt="" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" src={`/news/image/${post.id}`}/></div>}<div className="mt-10 whitespace-pre-wrap text-base leading-8 text-foreground">{post.body}</div><div className="mt-10 flex justify-end border-t pt-6"><ReportContentLink returnTo={`/news/${post.slug}`} targetId={post.id} targetType="organization_post"/></div></article></main><SiteFooter/></div>
}
