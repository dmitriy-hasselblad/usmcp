import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getResourceGuide, resourceGuides } from "@/lib/resources/content"

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return resourceGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const guide = getResourceGuide(slug)
  if (!guide) return {}
  return { title: guide.title, description: guide.description }
}

export default async function ResourceGuidePage({ params }: { params: Params }) {
  const { slug } = await params
  const guide = getResourceGuide(slug)
  if (!guide) notFound()

  return <div className="min-h-dvh bg-background"><SiteHeader /><main><article><header className="border-b border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eff9f7_52%,#f8fcff_100%)]"><div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16"><Button asChild size="sm" variant="ghost"><Link href="/resources"><ArrowLeft />All resources</Link></Button><Badge className="mt-8" variant="outline">{guide.category}</Badge><h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{guide.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{guide.description}</p><p className="mt-5 text-sm font-medium text-primary">{guide.readTime} · General career guidance</p></div></header><div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14">{guide.image ? <Image alt={guide.image.alt} className="aspect-[16/8] w-full rounded-3xl border border-border object-cover" height={960} priority src={guide.image.src} width={1920} /> : <div className="grid aspect-[16/8] place-items-center rounded-3xl border border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eff9f7_52%,#f8fcff_100%)]"><ShieldCheck className="size-12 text-primary/70" /></div>}<div className="mx-auto mt-10 max-w-3xl"><p className="text-lg leading-8 text-muted-foreground">{guide.introduction}</p><div className="mt-10 grid gap-10">{guide.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-semibold tracking-[-0.04em]">{section.heading}</h2><div className="mt-4 grid gap-4 text-base leading-7 text-muted-foreground">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{section.checklist && <ul className="mt-5 grid gap-3 rounded-2xl border border-border bg-muted/35 p-5 text-sm leading-6 text-foreground">{section.checklist.map((item) => <li className="flex gap-3" key={item}><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}</ul>}</section>)}</div>{guide.sources && <aside className="mt-10 rounded-2xl border border-primary/15 bg-primary/5 p-5"><h2 className="font-semibold">Official sources</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Review the current requirements directly with the relevant authority.</p><ul className="mt-4 grid gap-2 text-sm font-medium">{guide.sources.map((source) => <li key={source.url}><a className="inline-flex items-center gap-2 text-primary hover:underline" href={source.url} rel="noreferrer" target="_blank">{source.label} <ExternalLink className="size-3.5" /></a></li>)}</ul></aside>}{guide.note && <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Important:</strong> {guide.note}</aside>}<div className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-3"><Button asChild><Link href="/jobs">Find jobs <ArrowRight /></Link></Button><Button asChild variant="outline"><Link href="/dashboard/resumes">Build your CV <ArrowRight /></Link></Button><Button asChild variant="outline"><Link href="/dashboard/job-alerts">Set Job Alerts <ArrowRight /></Link></Button></div></div></div></article></main><SiteFooter /></div>
}
