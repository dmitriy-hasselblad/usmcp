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
  isSmviaCareerGuide,
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
  const guidePosts = posts.filter(isSmviaCareerGuide)
  const displayedGuidePosts = guidePosts.slice(0, 3)
  const organizationPosts = posts.filter((post) => !isSmviaCareerGuide(post))

  return (
    <div className="min-h-dvh bg-[#f4f8fb] text-slate-950">
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[27rem] overflow-hidden border-b border-sky-100 bg-[#eaf6fc] lg:min-h-[31rem]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[68%]">
            <Image
              alt="Healthcare professional in a hospital"
              className="object-cover object-[86%_center]"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 68vw"
              src="/images/news/news-hero-nurse.png"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#eaf6fc_0%,#edf8fd_40%,rgba(234,246,252,0.82)_53%,rgba(234,246,252,0.08)_72%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-xs font-bold tracking-[0.2em] text-sky-800/70 uppercase">Perspective for a stronger healthcare workforce</p>
              <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-[#0c2340] sm:text-6xl lg:text-7xl">
                Career intelligence for U.S. healthcare.
              </h1>
              <p className="mt-6 max-w-2xl font-serif text-xl leading-8 text-slate-600">
                Independent guidance, employer news and practical resources — all in one place, from SM VIA.
              </p>
              <div className="mt-8 flex flex-wrap gap-3" aria-label="Browse article types">
                <Button asChild className="rounded-full bg-[#123d63] px-7 hover:bg-[#0c2e4b]" size="sm"><Link href="/news">All</Link></Button>
                <Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline"><Link href="#smvia-career-guides">SM VIA Career Guides</Link></Button>
                <Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline"><Link href="#organization-updates">Organization updates</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="hidden">
              <div className="mb-5"><p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Browse insights</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Find a published article</h2></div>
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
                  <Button className="rounded-full" type="submit">Apply filters</Button>
                  {filtered && (
                    <Button asChild variant="outline">
                      <Link href="/news">Clear filters</Link>
                    </Button>
                  )}
                </div>
              </form>
              <p className="mt-5 text-sm text-muted-foreground">
                Showing {count} {count === 1 ? "article" : "articles"} · {periodLabel}
              </p>
          </div>

          {posts.length ? (
            <>
              {guidePosts.length > 0 && <section id="smvia-career-guides" className="scroll-mt-24"><div className="mb-7 flex flex-wrap items-baseline justify-between gap-4"><div className="flex flex-wrap items-baseline gap-x-7 gap-y-2"><p className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[#123d63]">SM VIA CAREER GUIDES</p><p className="text-base text-slate-500">Practical, independently researched guidance from SM VIA.</p></div>{guidePosts.length > 3 ? <Link className="text-sm font-semibold text-teal-600 hover:underline" href="/news/guides">View all career guides →</Link> : null}</div>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {displayedGuidePosts.map((post) => (
                <Card className="group overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl" key={post.id}>
                  {newsCoverSrc(post) && (
                    <div className="relative aspect-[16/8] overflow-hidden">
                      <Image
                        alt=""
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={newsCoverSrc(post)!}
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <Badge className="rounded-full border-0 bg-[#d9f4f5] px-3 py-1 text-[0.65rem] text-teal-700" variant="secondary">SM VIA Career Guide</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Published {formatNewsDate(post.published_at)}
                    </p>
                    <h2 className="mt-4 font-serif text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#142c48]">
                      <Link
                        className="hover:text-primary"
                        href={`/news/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {post.excerpt}
                    </p>
                    <Link className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:underline" href={`/news/${post.slug}`}>Read guide →</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
              </section>}
              <section id="organization-updates" className="mt-16 scroll-mt-24 border-t border-slate-200 pt-10">
                <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4"><div><p className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[#142c48]">Organization updates</p><p className="mt-2 text-base text-slate-500">Perspectives and announcements from participating healthcare organizations.</p></div><Link className="text-sm font-semibold text-teal-600 hover:underline" href="#organization-updates">View all updates →</Link></div>
                {organizationPosts.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{organizationPosts.map((post) => (
                  <Card className="group overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl" key={post.id}>
                    {newsCoverSrc(post) && <div className="relative aspect-[16/10] overflow-hidden"><Image alt="" className="object-cover transition duration-500 group-hover:scale-[1.03]" fill sizes="(max-width: 768px) 100vw, 33vw" src={newsCoverSrc(post)!} /></div>}
                    <CardContent className="p-7"><Badge className="rounded-full text-[0.65rem]" variant="outline">Employer update</Badge><p className="mt-3 text-xs text-muted-foreground">Published {formatNewsDate(post.published_at)}</p><h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.045em]"><Link className="hover:text-primary" href={`/news/${post.slug}`}>{post.title}</Link></h2><p className="mt-4 text-sm leading-6 text-muted-foreground">{post.excerpt}</p></CardContent>
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
