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
  getEditorialGuideSources,
  getPublishedOrganizationPost,
  getPublicNewsOrganization,
  isSmviaCareerGuide,
  newsCoverSrc,
} from "@/lib/news/public-news"
import { isPlatformDemonstrationOrganization } from "@/lib/platform-content"

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
  const post = await getPublishedOrganizationPost((await params).slug)
  if (!post) notFound()

  const organization = await getPublicNewsOrganization(post.organization_id)
  const address = organization
    ? [
        organization.address_line1,
        organization.address_line2,
        [organization.city, organization.state_code, organization.postal_code]
          .filter(Boolean)
          .join(", "),
      ].filter(Boolean)
    : []
  const hasContact =
    organization &&
    (organization.website ||
      organization.public_email ||
      organization.public_phone ||
      address.length)
  const isUshceEditorial = isPlatformDemonstrationOrganization(organization?.name)
  const isSmviaGuide = isSmviaCareerGuide({ slug: post.slug })
  const guideSources = getEditorialGuideSources(post.slug)

  return (
    <div className="min-h-dvh bg-white">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
          <Link
            href="/news"
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to News & insights
          </Link>
          {organization && (
            <p className="mt-8 text-sm font-bold tracking-wide text-primary uppercase">
              <Link
                className="hover:underline"
                href={`/companies/${organization.slug}`}
              >
                {organization.name}
              </Link>
            </p>
          )}
          <Badge className="mt-4" variant="outline">
            {isSmviaGuide
              ? "SM VIA Career Guide"
              : isUshceEditorial
                ? "Platform demonstration"
                : "Organization insight"}
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-5 text-sm text-muted-foreground">
            <span>Published {formatNewsDate(post.published_at)}</span>
          </div>
          {newsCoverSrc(post) && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl">
              <Image
                alt=""
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
                src={newsCoverSrc(post)!}
              />
            </div>
          )}
          <div className="mt-10 whitespace-pre-wrap text-base leading-8 text-foreground">
            {post.body}
          </div>
          {guideSources.length > 0 && (
            <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/70 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Official sources and further reading</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This guide is original SM VIA editorial content. The sources below support the regulatory, wage, certification, or safety context discussed here. Requirements can change, so confirm decisions directly with the relevant board, employer, or agency.
              </p>
              <ul className="mt-5 grid gap-3 text-sm">
                {guideSources.map((source) => (
                  <li key={source.href}>
                    <a className="font-semibold text-primary hover:underline" href={source.href} rel="noreferrer" target="_blank">
                      {source.label}
                    </a>
                    <span className="text-slate-600"> · {source.publisher}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {isUshceEditorial && (
            <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <h2 className="font-semibold">Demonstration note</h2>
              <p className="mt-2">This article is sample content published by SM VIA to demonstrate News &amp; Insights. It is not an announcement from a clinic, hospital, government agency, or other healthcare employer.</p>
            </section>
          )}
          {hasContact && (
            <section className="mt-12 border-t pt-8">
              <h2 className="text-xl font-semibold">About {organization.name}</h2>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {organization.website && (
                  <a
                    className="text-primary hover:underline"
                    href={organization.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit organization website
                  </a>
                )}
                {organization.public_email && (
                  <a
                    className="text-primary hover:underline"
                    href={`mailto:${organization.public_email}`}
                  >
                    {organization.public_email}
                  </a>
                )}
                {organization.public_phone && (
                  <a
                    className="text-primary hover:underline"
                    href={`tel:${organization.public_phone}`}
                  >
                    {organization.public_phone}
                  </a>
                )}
                {address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          )}
          <div className="mt-10 flex justify-end border-t pt-6">
            <ReportContentLink
              returnTo={`/news/${post.slug}`}
              targetId={post.id}
              targetType="organization_post"
            />
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
