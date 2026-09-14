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
  getPublishedNewsPosts,
  isSmviaCareerGuide,
  newsCoverSrc,
  newsMonthNames,
  parseNewsMonth,
  parseNewsPage,
  parseNewsYear,
} from "@/lib/news/public-news"

export const metadata: Metadata = {
  title: "Healthcare News & Insights",
  description: "Updates and insights from verified U.S. healthcare organizations.",
  alternates: { canonical: "/news" },
}

const archivePageSize = 12

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type PublishedNewsPost = Awaited<ReturnType<typeof getPublishedNewsPosts>>[number]

type SectionFilters = {
  guideYear?: number
  guideMonth?: number
  guidePage: number
  guideViewAll: boolean
  updateOrganizationId?: string
  updateYear?: number
  updateMonth?: number
  updatePage: number
  updateViewAll: boolean
}

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function PublicNewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = readFilters(params)
  const [posts, archiveYears] = await Promise.all([
    getPublishedNewsPosts(),
    getNewsArchiveYears(),
  ])

  const guides = posts.filter(isSmviaCareerGuide)
  const updates = posts.filter((post) => !isSmviaCareerGuide(post))
  const organizations = getOrganizationsWithPublishedUpdates(updates)

  const filteredGuides = filterByDate(
    guides,
    filters.guideYear,
    filters.guideMonth,
  )
  const filteredUpdates = filterByDate(
    updates,
    filters.updateYear,
    filters.updateMonth,
  ).filter(
    (post) =>
      !filters.updateOrganizationId ||
      post.organization_id === filters.updateOrganizationId,
  )

  const guideIsArchive = Boolean(
    filters.guideViewAll || filters.guideYear || filters.guideMonth,
  )
  const updateIsArchive = Boolean(
    filters.updateViewAll ||
      filters.updateOrganizationId ||
      filters.updateYear ||
      filters.updateMonth,
  )
  const guideTotalPages = Math.max(
    1,
    Math.ceil(filteredGuides.length / archivePageSize),
  )
  const updateTotalPages = Math.max(
    1,
    Math.ceil(filteredUpdates.length / archivePageSize),
  )

  if (filters.guidePage > guideTotalPages) {
    redirect(newsHref({ ...filters, guidePage: guideTotalPages }))
  }
  if (filters.updatePage > updateTotalPages) {
    redirect(newsHref({ ...filters, updatePage: updateTotalPages }))
  }

  const guidePosts = guideIsArchive
    ? filteredGuides.slice(
        (filters.guidePage - 1) * archivePageSize,
        filters.guidePage * archivePageSize,
      )
    : guides.slice(0, 3)
  const updatePosts = updateIsArchive
    ? filteredUpdates.slice(
        (filters.updatePage - 1) * archivePageSize,
        filters.updatePage * archivePageSize,
      )
    : updates.slice(0, 3)

  return (
    <div className="min-h-dvh bg-[#f4f8fb] text-slate-950">
      <SiteHeader />
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <NewsSection
            id="smvia-career-guides"
            title="SM VIA CAREER GUIDES"
            description="Practical, independently researched guidance from SM VIA."
            posts={guidePosts}
            kind="guide"
            emptyMessage="Career guides will appear here."
            controls={
              <GuideFilters
                archiveYears={archiveYears}
                filters={filters}
                isArchive={guideIsArchive}
              />
            }
            action={
              !guideIsArchive ? (
                <Link
                  className="text-sm font-semibold text-teal-600 hover:underline"
                  href={newsHref({ ...filters, guideViewAll: true, guidePage: 1 })}
                >
                  View all career guides →
                </Link>
              ) : undefined
            }
          />
          {guideIsArchive && (
            <SectionPagination
              filters={filters}
              page={filters.guidePage}
              totalPages={guideTotalPages}
              type="guide"
            />
          )}

          <NewsSection
            className="mt-16 border-t border-slate-200 pt-10"
            id="organization-updates"
            title="Organization updates"
            description="Perspectives and announcements from participating healthcare organizations."
            posts={updatePosts}
            kind="update"
            emptyMessage="Organization updates will appear here."
            controls={
              <UpdateFilters
                archiveYears={archiveYears}
                filters={filters}
                isArchive={updateIsArchive}
                organizations={organizations}
              />
            }
            action={
              !updateIsArchive ? (
                <Link
                  className="text-sm font-semibold text-teal-600 hover:underline"
                  href={newsHref({ ...filters, updateViewAll: true, updatePage: 1 })}
                >
                  View all updates →
                </Link>
              ) : undefined
            }
          />
          {updateIsArchive && (
            <SectionPagination
              filters={filters}
              page={filters.updatePage}
              totalPages={updateTotalPages}
              type="update"
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative isolate min-h-[27rem] overflow-hidden border-b border-sky-100 bg-[#eaf6fc] lg:h-[24rem] lg:min-h-0">
      <div className="absolute inset-y-0 left-0 right-0 mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative h-full">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[60%]">
            <Image
              alt="Healthcare professional in a hospital"
              className="object-contain object-left"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              src="/images/news/news-hero-nurse.png"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#eaf6fc_0%,#edf8fd_40%,rgba(234,246,252,0.82)_53%,rgba(234,246,252,0.08)_72%)]" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 py-16 lg:px-8 lg:py-0">
        <div className="max-w-4xl">
          <p className="text-xs font-bold tracking-[0.2em] text-sky-800/70 uppercase">
            Perspective for a stronger healthcare workforce
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#0c2340] sm:text-6xl lg:text-7xl">
            Career intelligence for U.S. healthcare.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
            Independent guidance, employer news and practical resources — all in
            one place, from SM VIA.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" aria-label="Browse article types">
            <Button asChild className="rounded-full bg-[#123d63] px-7 hover:bg-[#0c2e4b]" size="sm">
              <Link href="/news">All</Link>
            </Button>
            <Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline">
              <Link href="#smvia-career-guides">SM VIA Career Guides</Link>
            </Button>
            <Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline">
              <Link href="#organization-updates">Organization updates</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsSection({
  id,
  title,
  description,
  posts,
  kind,
  controls,
  action,
  className,
  emptyMessage,
}: {
  id: string
  title: string
  description: string
  posts: PublishedNewsPost[]
  kind: "guide" | "update"
  controls: React.ReactNode
  action?: React.ReactNode
  className?: string
  emptyMessage: string
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${className ?? ""}`}>
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-[-0.055em] text-[#142c48]">
            {title}
          </p>
          <p className="mt-2 text-base text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {controls}
      {posts.length ? (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.id} kind={kind} post={post} />
          ))}
        </div>
      ) : (
        <Card className="bg-white">
          <CardContent className="p-7">
            <p className="font-semibold">{emptyMessage}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This area will update automatically when a publication is approved.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function GuideFilters({
  archiveYears,
  filters,
  isArchive,
}: {
  archiveYears: number[]
  filters: SectionFilters
  isArchive: boolean
}) {
  return (
    <form action="/news" className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" method="get">
      <PreservedUpdateFilters filters={filters} />
      <input name="guideView" type="hidden" value="all" />
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Guide filters</p>
        <p className="mt-1 text-sm text-muted-foreground">Filter only SM VIA Career Guides by publication date.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_auto] md:items-end">
        <FilterSelect label="Publication year" name="guideYear" defaultValue={filters.guideYear ? String(filters.guideYear) : ""} options={[{ label: "All years", value: "" }, ...archiveYears.map((value) => ({ label: String(value), value: String(value) }))]} />
        <FilterSelect label="Publication month" name="guideMonth" defaultValue={filters.guideMonth ? String(filters.guideMonth) : ""} options={monthOptions} />
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" type="submit">Apply filters</Button>
          {isArchive && <Button asChild variant="outline"><Link href={newsHref(clearGuideFilters(filters))}>Clear</Link></Button>}
        </div>
      </div>
    </form>
  )
}

function UpdateFilters({
  archiveYears,
  filters,
  isArchive,
  organizations,
}: {
  archiveYears: number[]
  filters: SectionFilters
  isArchive: boolean
  organizations: Array<{ id: string; name: string }>
}) {
  return (
    <form action="/news" className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" method="get">
      <PreservedGuideFilters filters={filters} />
      <input name="updateView" type="hidden" value="all" />
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Organization update filters</p>
        <p className="mt-1 text-sm text-muted-foreground">Only organizations with at least one published update appear in this list.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(12rem,1.3fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] xl:items-end">
        <FilterSelect label="Organization" name="updateOrganization" defaultValue={filters.updateOrganizationId ?? ""} options={[{ label: "All organizations", value: "" }, ...organizations.map((organization) => ({ label: organization.name, value: organization.id }))]} />
        <FilterSelect label="Publication year" name="updateYear" defaultValue={filters.updateYear ? String(filters.updateYear) : ""} options={[{ label: "All years", value: "" }, ...archiveYears.map((value) => ({ label: String(value), value: String(value) }))]} />
        <FilterSelect label="Publication month" name="updateMonth" defaultValue={filters.updateMonth ? String(filters.updateMonth) : ""} options={monthOptions} />
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" type="submit">Apply filters</Button>
          {isArchive && <Button asChild variant="outline"><Link href={newsHref(clearUpdateFilters(filters))}>Clear</Link></Button>}
        </div>
      </div>
    </form>
  )
}

function PreservedGuideFilters({ filters }: { filters: SectionFilters }) {
  return <><HiddenInput name="guideView" value={filters.guideViewAll ? "all" : undefined} /><HiddenInput name="guideYear" value={filters.guideYear} /><HiddenInput name="guideMonth" value={filters.guideMonth} /><HiddenInput name="guidePage" value={filters.guidePage > 1 ? filters.guidePage : undefined} /></>
}

function PreservedUpdateFilters({ filters }: { filters: SectionFilters }) {
  return <><HiddenInput name="updateView" value={filters.updateViewAll ? "all" : undefined} /><HiddenInput name="updateOrganization" value={filters.updateOrganizationId} /><HiddenInput name="updateYear" value={filters.updateYear} /><HiddenInput name="updateMonth" value={filters.updateMonth} /><HiddenInput name="updatePage" value={filters.updatePage > 1 ? filters.updatePage : undefined} /></>
}

function HiddenInput({ name, value }: { name: string; value?: string | number }) {
  return value ? <input name={name} type="hidden" value={value} /> : null
}

function ArticleCard({ post, kind }: { post: PublishedNewsPost; kind: "guide" | "update" }) {
  const guide = kind === "guide"
  const cover = newsCoverSrc(post)
  return (
    <Card className="group overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {cover && <div className="relative aspect-[16/8] overflow-hidden"><Image alt="" className="object-cover transition duration-500 group-hover:scale-[1.03]" fill sizes="(max-width: 768px) 100vw, 33vw" src={cover} /></div>}
      <CardContent className="p-5">
        <Badge className={guide ? "rounded-full border-0 bg-[#d9f4f5] px-3 py-1 text-[0.65rem] text-teal-700" : "rounded-full text-[0.65rem]"} variant={guide ? "secondary" : "outline"}>{guide ? "SM VIA Career Guide" : "Organization update"}</Badge>
        <p className="mt-2 text-xs text-muted-foreground">Published {formatNewsDate(post.published_at)}</p>
        <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#142c48]"><Link className="hover:text-primary" href={`/news/${post.slug}`}>{post.title}</Link></h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:underline" href={`/news/${post.slug}`}>{guide ? "Read guide →" : "Read update →"}</Link>
      </CardContent>
    </Card>
  )
}

function FilterSelect({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: Array<{ label: string; value: string }> }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={defaultValue} name={name}>{options.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>
}

function SectionPagination({ filters, page, totalPages, type }: { filters: SectionFilters; page: number; totalPages: number; type: "guide" | "update" }) {
  const previous = type === "guide" ? { ...filters, guidePage: page - 1 } : { ...filters, updatePage: page - 1 }
  const next = type === "guide" ? { ...filters, guidePage: page + 1 } : { ...filters, updatePage: page + 1 }
  return <nav aria-label={`${type} pagination`} className="mt-8 flex items-center justify-between gap-4"><Button asChild={page > 1} disabled={page <= 1} variant="outline">{page > 1 ? <Link href={newsHref(previous)}>Previous</Link> : <span>Previous</span>}</Button><span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span><Button asChild={page < totalPages} disabled={page >= totalPages} variant="outline">{page < totalPages ? <Link href={newsHref(next)}>Next</Link> : <span>Next</span>}</Button></nav>
}

const monthOptions = [{ label: "All months", value: "" }, ...newsMonthNames.map((name, index) => ({ label: name, value: String(index + 1) }))]

function filterByDate(posts: PublishedNewsPost[], year?: number, month?: number) {
  if (!year) return posts
  return posts.filter((post) => {
    const published = post.published_at ? new Date(post.published_at) : undefined
    return Boolean(published && published.getUTCFullYear() === year && (!month || published.getUTCMonth() + 1 === month))
  })
}

function getOrganizationsWithPublishedUpdates(posts: PublishedNewsPost[]) {
  const byId = new Map<string, { id: string; name: string }>()
  for (const post of posts) {
    const organization = Array.isArray(post.organizations) ? post.organizations[0] : post.organizations
    if (organization?.name) byId.set(post.organization_id, { id: post.organization_id, name: organization.name })
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function readFilters(params: Record<string, string | string[] | undefined>): SectionFilters {
  const guideYear = parseNewsYear(firstValue(params.guideYear))
  const updateYear = parseNewsYear(firstValue(params.updateYear))
  return {
    guideYear,
    guideMonth: parseNewsMonth(firstValue(params.guideMonth), guideYear),
    guidePage: parseNewsPage(firstValue(params.guidePage)),
    guideViewAll: firstValue(params.guideView) === "all",
    updateOrganizationId: parseOrganizationId(firstValue(params.updateOrganization)),
    updateYear,
    updateMonth: parseNewsMonth(firstValue(params.updateMonth), updateYear),
    updatePage: parseNewsPage(firstValue(params.updatePage)),
    updateViewAll: firstValue(params.updateView) === "all",
  }
}

function parseOrganizationId(value?: string) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined
}

function clearGuideFilters(filters: SectionFilters): SectionFilters {
  return { ...filters, guideYear: undefined, guideMonth: undefined, guidePage: 1, guideViewAll: false }
}

function clearUpdateFilters(filters: SectionFilters): SectionFilters {
  return { ...filters, updateOrganizationId: undefined, updateYear: undefined, updateMonth: undefined, updatePage: 1, updateViewAll: false }
}

function newsHref(filters: SectionFilters) {
  const params = new URLSearchParams()
  if (filters.guideViewAll) params.set("guideView", "all")
  if (filters.guideYear) params.set("guideYear", String(filters.guideYear))
  if (filters.guideMonth) params.set("guideMonth", String(filters.guideMonth))
  if (filters.guidePage > 1) params.set("guidePage", String(filters.guidePage))
  if (filters.updateViewAll) params.set("updateView", "all")
  if (filters.updateOrganizationId) params.set("updateOrganization", filters.updateOrganizationId)
  if (filters.updateYear) params.set("updateYear", String(filters.updateYear))
  if (filters.updateMonth) params.set("updateMonth", String(filters.updateMonth))
  if (filters.updatePage > 1) params.set("updatePage", String(filters.updatePage))
  const query = params.toString()
  return query ? `/news?${query}` : "/news"
}
