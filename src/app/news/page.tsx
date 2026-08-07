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
}

type SearchParams = Promise<{
  year?: string | string[]
  month?: string | string[]
  page?: string | string[]
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
  const [{ posts, count }, archiveYears] = await Promise.all([
    getPublishedOrganizationPosts(year, month, page),
    getNewsArchiveYears(),
  ])
  const filtered = Boolean(year)
  const totalPages = Math.max(1, Math.ceil(count / newsPageSize))
  if (count > 0 && page > totalPages) {
    redirect(newsPageHref(totalPages, year, month))
  }
  const periodLabel = year
    ? month
      ? `${newsMonthNames[month - 1]} ${year}`
      : String(year)
    : "All publication dates"

  return (
    <div className="min-h-dvh bg-muted/25">
      <SiteHeader />
      <main>
        <section className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <Badge variant="outline">News & insights</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Stories from U.S. healthcare organizations.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
              Read employer updates, care innovations, community stories, and
              practical healthcare insights.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <Card className="mb-8 bg-white">
            <CardContent className="p-5 sm:p-6">
              <form
                action="/news"
                className="grid gap-4 sm:grid-cols-[minmax(10rem,14rem)_minmax(10rem,14rem)_auto] sm:items-end"
                method="get"
              >
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card className="overflow-hidden bg-white" key={post.id}>
                  {post.cover_image_path && (
                    <div className="relative aspect-[16/9]">
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={`/news/image/${post.id}`}
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <p className="text-xs font-bold tracking-wide text-primary uppercase">
                      {post.organizations?.[0]?.name ??
                        "Healthcare organization"}
                    </p>
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
                  <Link href={newsPageHref(page - 1, year, month)}>
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
                  <Link href={newsPageHref(page + 1, year, month)}>Next</Link>
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

function newsPageHref(page: number, year?: number, month?: number) {
  const params = new URLSearchParams()
  if (year) params.set("year", String(year))
  if (month) params.set("month", String(month))
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/news?${query}` : "/news"
}
