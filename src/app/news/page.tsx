import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatNewsDate, getNewsArchiveYears, getPublishedNewsPosts, isSmviaCareerGuide, newsCoverSrc, newsMonthNames, parseNewsMonth, parseNewsPage, parseNewsYear } from "@/lib/news/public-news"

export const metadata: Metadata = { title: "Healthcare News & Insights", description: "Updates and insights from verified U.S. healthcare organizations.", alternates: { canonical: "/news" } }

const archivePageSize = 12
type ContentType = "all" | "guides" | "updates"
type SearchParams = Promise<{ year?: string | string[]; month?: string | string[]; page?: string | string[]; organization?: string | string[]; type?: string | string[] }>
type PublishedNewsPost = Awaited<ReturnType<typeof getPublishedNewsPosts>>[number]

const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value

export default async function PublicNewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const year = parseNewsYear(firstValue(params.year))
  const month = parseNewsMonth(firstValue(params.month), year)
  const page = parseNewsPage(firstValue(params.page))
  const organizationId = parseOrganizationId(firstValue(params.organization))
  const contentType = parseContentType(firstValue(params.type))
  const [posts, archiveYears] = await Promise.all([getPublishedNewsPosts(), getNewsArchiveYears()])
  const guides = posts.filter(isSmviaCareerGuide)
  const updates = posts.filter((post) => !isSmviaCareerGuide(post))
  const organizations = getOrganizationsWithPublishedUpdates(updates)
  const hasArchiveFilters = Boolean(year || month || organizationId || contentType !== "all")
  const filteredPosts = posts.filter((post) => {
    if (contentType === "guides" && !isSmviaCareerGuide(post)) return false
    if (contentType === "updates" && isSmviaCareerGuide(post)) return false
    if (organizationId && post.organization_id !== organizationId) return false
    if (!year) return true
    const published = post.published_at ? new Date(post.published_at) : undefined
    return Boolean(published && published.getUTCFullYear() === year && (!month || published.getUTCMonth() + 1 === month))
  })
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / archivePageSize))
  if (hasArchiveFilters && page > totalPages) redirect(newsPageHref(totalPages, year, month, organizationId, contentType))
  const archivePosts = hasArchiveFilters ? filteredPosts.slice((page - 1) * archivePageSize, page * archivePageSize) : []

  return <div className="min-h-dvh bg-[#f4f8fb] text-slate-950"><SiteHeader /><main>
    <section className="relative isolate min-h-[27rem] overflow-hidden border-b border-sky-100 bg-[#eaf6fc] lg:h-[24rem] lg:min-h-0">
      <div className="absolute inset-y-0 left-0 right-0 mx-auto max-w-7xl px-5 lg:px-8"><div className="relative h-full"><div className="absolute inset-y-0 right-0 w-full lg:w-[60%]"><Image alt="Healthcare professional in a hospital" className="object-contain object-left" fill priority sizes="(max-width: 1024px) 100vw, 60vw" src="/images/news/news-hero-nurse.png" /></div></div></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#eaf6fc_0%,#edf8fd_40%,rgba(234,246,252,0.82)_53%,rgba(234,246,252,0.08)_72%)]" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 py-16 lg:px-8 lg:py-0"><div className="max-w-4xl"><p className="text-xs font-bold tracking-[0.2em] text-sky-800/70 uppercase">Perspective for a stronger healthcare workforce</p><h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#0c2340] sm:text-6xl lg:text-7xl">Career intelligence for U.S. healthcare.</h1><p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">Independent guidance, employer news and practical resources — all in one place, from SM VIA.</p><div className="mt-8 flex flex-wrap gap-3" aria-label="Browse article types"><Button asChild className="rounded-full bg-[#123d63] px-7 hover:bg-[#0c2e4b]" size="sm"><Link href="/news">All</Link></Button><Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline"><Link href="#smvia-career-guides">SM VIA Career Guides</Link></Button><Button asChild className="rounded-full border-sky-100 bg-white/85 px-7 text-[#123d63] hover:bg-white" size="sm" variant="outline"><Link href="#organization-updates">Organization updates</Link></Button></div></div></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 pt-7 pb-12 lg:px-8 lg:pt-8 lg:pb-16">
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Find published articles"><div className="mb-5"><p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Browse insights</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Find a published article</h2></div><form action="/news" className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(12rem,1.25fr)_minmax(10rem,1fr)_auto] xl:items-end" method="get"><FilterSelect label="Content type" name="type" defaultValue={contentType} options={[{ label: "All content", value: "all" }, { label: "SM VIA Career Guides", value: "guides" }, { label: "Organization updates", value: "updates" }]} /><FilterSelect label="Publication year" name="year" defaultValue={year ? String(year) : ""} options={[{ label: "All years", value: "" }, ...archiveYears.map((value) => ({ label: String(value), value: String(value) }))]} /><FilterSelect label="Organization" name="organization" defaultValue={organizationId ?? ""} options={[{ label: "All organizations", value: "" }, ...organizations.map((organization) => ({ label: organization.name, value: organization.id }))]} /><FilterSelect label="Publication month" name="month" defaultValue={month ? String(month) : ""} options={[{ label: "All months", value: "" }, ...newsMonthNames.map((name, index) => ({ label: name, value: String(index + 1) }))]} /><div className="flex flex-wrap gap-3"><Button className="rounded-full" type="submit">Apply filters</Button>{hasArchiveFilters && <Button asChild variant="outline"><Link href="/news">Clear</Link></Button>}</div></form><p className="mt-5 text-sm text-muted-foreground">{organizations.length} {organizations.length === 1 ? "organization has" : "organizations have"} published updates. Organizations appear here automatically after their first approved publication.</p></section>
      {hasArchiveFilters ? <ArchiveResults posts={archivePosts} total={filteredPosts.length} /> : <><NewsSection id="smvia-career-guides" title="SM VIA CAREER GUIDES" description="Practical, independently researched guidance from SM VIA." href="/news?type=guides" linkLabel="View all career guides →" posts={guides.slice(0, 3)} kind="guide" /><NewsSection id="organization-updates" title="Organization updates" description="Perspectives and announcements from participating healthcare organizations." href="/news?type=updates" linkLabel="View all updates →" posts={updates.slice(0, 3)} kind="update" className="mt-16 border-t border-slate-200 pt-10" emptyMessage="Organization updates will appear here." /></>}
      {hasArchiveFilters && totalPages > 1 && <Pagination page={page} totalPages={totalPages} year={year} month={month} organizationId={organizationId} contentType={contentType} />}
    </section>
  </main><SiteFooter /></div>
}

function NewsSection({ id, title, description, href, linkLabel, posts, kind, className, emptyMessage }: { id: string; title: string; description: string; href: string; linkLabel: string; posts: PublishedNewsPost[]; kind: "guide" | "update"; className?: string; emptyMessage?: string }) {
  return <section id={id} className={`scroll-mt-24 ${className ?? ""}`}><div className="mb-7 flex flex-wrap items-baseline justify-between gap-4"><div><p className="text-4xl font-semibold tracking-[-0.055em] text-[#142c48]">{title}</p><p className="mt-2 text-base text-slate-500">{description}</p></div><Link className="text-sm font-semibold text-teal-600 hover:underline" href={href}>{linkLabel}</Link></div>{posts.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <ArticleCard key={post.id} post={post} kind={kind} />)}</div> : <Card className="bg-white"><CardContent className="p-7"><p className="font-semibold">{emptyMessage ?? "No published articles yet."}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">This area will update automatically when a publication is approved.</p></CardContent></Card>}</section>
}

function ArchiveResults({ posts, total }: { posts: PublishedNewsPost[]; total: number }) { return <section><div className="mb-7"><p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Archive results</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-[#142c48]">Published articles</h2><p className="mt-2 text-base text-slate-500">{total} {total === 1 ? "article" : "articles"} match your selection.</p></div>{posts.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <ArticleCard key={post.id} post={post} kind={isSmviaCareerGuide(post) ? "guide" : "update"} />)}</div> : <Card className="bg-white"><CardContent className="p-12 text-center"><h2 className="text-2xl font-semibold">No articles match this selection.</h2><p className="mt-3 text-muted-foreground">Choose another organization, year, month, or content type.</p></CardContent></Card>}</section> }

function ArticleCard({ post, kind }: { post: PublishedNewsPost; kind: "guide" | "update" }) { const guide = kind === "guide"; return <Card className="group overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">{newsCoverSrc(post) && <div className="relative aspect-[16/8] overflow-hidden"><Image alt="" className="object-cover transition duration-500 group-hover:scale-[1.03]" fill sizes="(max-width: 768px) 100vw, 33vw" src={newsCoverSrc(post)!} /></div>}<CardContent className="p-5"><Badge className={guide ? "rounded-full border-0 bg-[#d9f4f5] px-3 py-1 text-[0.65rem] text-teal-700" : "rounded-full text-[0.65rem]"} variant={guide ? "secondary" : "outline"}>{guide ? "SM VIA Career Guide" : "Organization update"}</Badge><p className="mt-2 text-xs text-muted-foreground">Published {formatNewsDate(post.published_at)}</p><h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#142c48]"><Link className="hover:text-primary" href={`/news/${post.slug}`}>{post.title}</Link></h2><p className="mt-3 text-sm leading-6 text-slate-500">{post.excerpt}</p><Link className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:underline" href={`/news/${post.slug}`}>{guide ? "Read guide →" : "Read update →"}</Link></CardContent></Card> }

function FilterSelect({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: Array<{ label: string; value: string }> }) { return <label className="grid gap-2 text-sm font-medium">{label}<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={defaultValue} name={name}>{options.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label> }

function Pagination({ page, totalPages, year, month, organizationId, contentType }: { page: number; totalPages: number; year?: number; month?: number; organizationId?: string; contentType: ContentType }) { return <nav aria-label="News pagination" className="mt-8 flex items-center justify-between gap-4"><Button asChild={page > 1} disabled={page <= 1} variant="outline">{page > 1 ? <Link href={newsPageHref(page - 1, year, month, organizationId, contentType)}>Previous</Link> : <span>Previous</span>}</Button><span className="text-sm text-muted-foreground">Page {Math.min(page, totalPages)} of {totalPages}</span><Button asChild={page < totalPages} disabled={page >= totalPages} variant="outline">{page < totalPages ? <Link href={newsPageHref(page + 1, year, month, organizationId, contentType)}>Next</Link> : <span>Next</span>}</Button></nav> }

function getOrganizationsWithPublishedUpdates(posts: PublishedNewsPost[]) { const byId = new Map<string, { id: string; name: string }>(); for (const post of posts) { const organization = Array.isArray(post.organizations) ? post.organizations[0] : post.organizations; if (organization?.name) byId.set(post.organization_id, { id: post.organization_id, name: organization.name }) } return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)) }
function parseOrganizationId(value?: string) { return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined }
function parseContentType(value?: string): ContentType { return value === "guides" || value === "updates" ? value : "all" }
function newsPageHref(page: number, year?: number, month?: number, organizationId?: string, contentType: ContentType = "all") { const params = new URLSearchParams(); if (contentType !== "all") params.set("type", contentType); if (year) params.set("year", String(year)); if (month) params.set("month", String(month)); if (organizationId) params.set("organization", organizationId); if (page > 1) params.set("page", String(page)); const query = params.toString(); return query ? `/news?${query}` : "/news" }
