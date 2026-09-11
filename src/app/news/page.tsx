import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatNewsDate,
  getNewsArchiveYears,
  getPublishedOrganizationPosts,
  newsCoverSrc,
  newsPageSize,
  newsMonthNames,
  parseNewsMonth,
  parseNewsPage,
  parseNewsYear,
} from "@/lib/news/public-news"

export const metadata: Metadata = {
  title: "Healthcare News & Insights",
  description:
    "Updates and insights from verified U.S. healthcare organizations.",
  alternates: { canonical: "/news" },
}

type SearchParams = Promise<{
  year?: string | string[]
  month?: string | string[]
  page?: string | string[]
  organization?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PublicNewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const year = parseNewsYear(firstValue(params.year))
  const month = parseNewsMonth(firstValue(params.month), year)
  const page = parseNewsPage(firstValue(params.page))
  const organizationId = parseOrganizationId(firstValue(params.organization))
  const [{ posts, count }, archiveYears] = await Promise.all([
    getPublishedOrganizationPosts(year, month, page, organizationId),
    getNewsArchiveYears(),
  ])
  const filtered = Boolean(year || organizationId)
  const totalPages = Math.max(1, Math.ceil(count / newsPageSize))
  if (count > 0 && page > totalPages) {
    redirect(newsPageHref(totalPages, year, month, organizationId))
  }
  const periodLabel = year
    ? month
      ? `${newsMonthNames[month - 1]} ${year}`
      : String(year)
    : "All publication dates"
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)
  const isSmviaGuide = (post: (typeof posts)[number]) =>
    post.organizations?.[0]?.slug === "smvia-editorial" ||
    post.organizations?.[0]?.name?.trim().toLowerCase() === "sm via"
  const guidePosts = remainingPosts.filter(isSmviaGuide)
  const organizationPosts = remainingPosts.filter((post) => !isSmviaGuide(post))

  return (
    <div className="min-h-dvh bg-muted/25">
      <SiteHeader />
      <main>
        <section className="border-b bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#edf8f6_100%)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:px-8 lg:py-16">
            <div>
              <Badge variant="outline">News &amp; insights</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                Career intelligence for U.S. healthcare.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Practical guidance for career decisions, licensure, salaries,
                employers, and the healthcare job market.
              </p>
              <div className="mt-7 flex flex-wrap gap-2" aria-label="Browse article types">
                <Button asChild size="sm"><Link href="/news">All</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="#smvia-career-guides">SM VIA Career Guides</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="#organization-updates">Organization updates</Link></Button>
              </div>
            </div>
            {featuredPost ? (
              <Card className="overflow-hidden bg-white shadow-sm">
                {newsCoverSrc(featuredPost) && (
                  <div className="relative aspect-[16/8] bg-muted">
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 400px"
                      src={newsCoverSrc(featuredPost)!}
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Featured insight</p>
                  <p className="mt-2 text-xs text-muted-foreground">Published {formatNewsDate(featuredPost.published_at)}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    <Link className="hover:text-primary" href={`/news/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{featuredPost.excerpt}</p>
                  <Link className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline" href={`/news/${featuredPost.slug}`}>Read article →</Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white"><CardContent className="p-7"><p className="text-sm font-semibold text-primary">Editorial desk</p><p className="mt-3 text-sm leading-6 text-muted-foreground">New practical healthcare career articles will appear here as they are reviewed and published.</p></CardContent></Card>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <Card className="mb-10 bg-white">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5"><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Browse the archive</p><h2 className="mt-2 text-xl font-semibold">Find a published article</h2></div>
              <form
                action="/news"
                className="grid gap-4 sm:grid-cols-[minmax(10rem,14rem)_minmax(10rem,14rem)_auto] sm:items-end"
                method="get"
              >
                {organizationId && (
                  <input name="organization" type="hidden" value={organizationId} />
                )}
                <label className="grid gap-2 text-sm font-medium">
                  Publication year
                  <select
                    className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue={year ?? ""}
                    name="year"
                  >
                    <option value="">All years</option>
                    {archiveYears.map((archiveYear) => (
                      <option key={archiveYear} value={archiveYear}>
                        {archiveYear}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Publication month
                  <select
                    className="h-11 rounded-lg border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:bg-muted"
                    defaultValue={month ?? ""}
                    name="month"
                  >
                    <option value="">All months</option>
                    {newsMonthNames.map((name, index) => (
                      <option key={name} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Apply filters</Button>
                  {filtered && (
                    <Button asChild variant="outline">
                      <Link href="/news">Clear filters</Link>
                    </Button>
                  )}
                </div>
              </form>
              <p className="mt-4 text-sm text-muted-foreground">
                Showing {count} {count === 1 ? "article" : "articles"} · {periodLabel}
              </p>
            </CardContent>
          </Card>

          {posts.length ? (
            <>
              {guidePosts.length > 0 && <section id="smvia-career-guides" className="scroll-mt-24"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">SM VIA career guides</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Practical guidance for the next move.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Independently researched career guidance from SM VIA — designed to help healthcare professionals make informed decisions.</p></div></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guidePosts.map((post) => (
                <Card className="overflow-hidden bg-white" key={post.id}>
                  {newsCoverSrc(post) && (
                    <div className="relative aspect-[16/9]">
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={newsCoverSrc(post)!}
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="text-[0.65rem]" variant="secondary">SM VIA Career Guide</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Published {formatNewsDate(post.published_at)}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold">
                      <Link
                        className="hover:text-primary"
                        href={`/news/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
              </section>}
              <section id="organization-updates" className="mt-14 scroll-mt-24 border-t pt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Organization updates</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">From healthcare organizations.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Updates, perspectives, and announcements published by participating healthcare employers and organizations.</p></div></div>
                {organizationPosts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{organizationPosts.map((post) => (
                  <Card className="overflow-hidden bg-white" key={post.id}>
                    {newsCoverSrc(post) && <div className="relative aspect-[16/9]"><Image alt="" className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={newsCoverSrc(post)!} /></div>}
                    <CardContent className="p-6"><Badge className="text-[0.65rem]" variant="outline">Employer update</Badge><p className="mt-3 text-xs text-muted-foreground">Published {formatNewsDate(post.published_at)}</p><h2 className="mt-3 text-xl font-semibold"><Link className="hover:text-primary" href={`/news/${post.slug}`}>{post.title}</Link></h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p></CardContent>
                  </Card>
                ))}</div> : <Card className="bg-white"><CardContent className="p-7"><p className="font-semibold">Organization updates will appear here.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">This area is reserved for verified healthcare organizations that publish their own updates on SM VIA.</p></CardContent></Card>}
              </section>
            </>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl font-semibold">
                  {filtered
                    ? "No articles in this period"
                    : "Stories are coming soon"}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {filtered
                    ? "Choose another year or month, or clear the filters to view all published stories."
                    : "Verified healthcare organizations are preparing their first updates."}
                </p>
              </CardContent>
            </Card>
          )}

          {count > 0 && totalPages > 1 && (
            <nav
              aria-label="News pagination"
              className="mt-8 flex items-center justify-between gap-4"
            >
              <Button asChild={page > 1} disabled={page <= 1} variant="outline">
                {page > 1 ? (
                  <Link href={newsPageHref(page - 1, year, month, organizationId)}>
                    Previous
                  </Link>
                ) : (
                  <span>Previous</span>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {Math.min(page, totalPages)} of {totalPages}
              </span>
              <Button
                asChild={page < totalPages}
                disabled={page >= totalPages}
                variant="outline"
              >
                {page < totalPages ? (
                  <Link href={newsPageHref(page + 1, year, month, organizationId)}>Next</Link>
                ) : (
                  <span>Next</span>
                )}
              </Button>
            </nav>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function parseOrganizationId(value?: string) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined
}

function newsPageHref(
  page: number,
  year?: number,
  month?: number,
  organizationId?: string,
) {
  const params = new URLSearchParams()
  if (year) params.set("year", String(year))
  if (month) params.set("month", String(month))
  if (organizationId) params.set("organization", organizationId)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/news?${query}` : "/news"
}
