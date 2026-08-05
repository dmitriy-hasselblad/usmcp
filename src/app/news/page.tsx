import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getPublishedOrganizationPosts } from "@/lib/news/public-news"

export const metadata: Metadata = { title: "Healthcare News & Insights", description: "Updates and insights from verified U.S. healthcare organizations." }
export default async function PublicNewsPage() {
  const posts = await getPublishedOrganizationPosts()
  return <div className="min-h-dvh bg-muted/25"><SiteHeader/><main><section className="border-b bg-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Badge variant="outline">News & insights</Badge><h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Stories from U.S. healthcare organizations.</h1><p className="mt-5 max-w-2xl leading-7 text-muted-foreground">Read employer updates, care innovations, community stories, and practical healthcare insights.</p></div></section><section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">{posts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(post => <Card className="overflow-hidden bg-white" key={post.id}>{post.cover_image_path && <div className="relative aspect-[16/9]"><Image alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" src={`/news/image/${post.id}`}/></div>}<CardContent className="p-6"><p className="text-xs font-bold tracking-wide text-primary uppercase">{post.organizations?.[0]?.name ?? "Healthcare organization"}</p><h2 className="mt-3 text-xl font-semibold"><Link href={`/news/${post.slug}`} className="hover:text-primary">{post.title}</Link></h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p></CardContent></Card>)}</div> : <Card className="bg-white"><CardContent className="p-12 text-center"><h2 className="text-2xl font-semibold">Stories are coming soon</h2><p className="mt-3 text-muted-foreground">Verified healthcare organizations are preparing their first updates.</p></CardContent></Card>}</section></main><SiteFooter/></div>
}
