import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Compass, Sparkles } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { careerPaths } from "@/lib/career-paths/content"

export const metadata: Metadata = {
  title: "Healthcare Career Paths",
  description: "Explore practical healthcare career transitions, education-to-career routes, and next steps for professionals at every stage.",
  alternates: { canonical: "/career-paths" },
}

export default function CareerPathsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eaf8f5_54%,#f9fcff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <Badge variant="outline">Career exploration</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Find a clearer route through healthcare.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Start from your education and experience—not a generic job title. These routes show where your background can transfer, what to develop next, and how to evaluate the path before making a large commitment.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl px-5"><Link href="#paths">Explore career paths <ArrowRight /></Link></Button>
              <Button asChild className="h-11 rounded-xl px-5" variant="outline"><Link href="/jobs">Search healthcare jobs</Link></Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/35">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:grid-cols-3 lg:px-8">
            <Value title="Start with what you have" text="Your education, clinical work, technical knowledge, and preferences are all part of the starting point." />
            <Value title="See realistic directions" text="Explore now, develop in parallel, and longer-term options are clearly separated—without invented match scores." />
            <Value title="Take a practical next step" text="Use current roles, resource guides, and targeted research before spending more time or money on education." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20" id="paths">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-bold tracking-[0.13em] text-primary uppercase">10 starter routes</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Explore a route that resembles your question.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">This library will grow with real career questions and verified, practical guidance.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {careerPaths.map((path) => <article className="flex min-h-72 flex-col rounded-2xl border border-border bg-white p-6 shadow-sm" key={path.slug}>
              <div className="flex items-center justify-between gap-4"><Badge className="border-primary/15 bg-primary/5 text-primary" variant="outline">{path.eyebrow}</Badge><Compass className="size-5 text-teal-700" /></div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{path.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{path.summary}</p>
              <Button asChild className="mt-auto justify-start px-0 pt-6 text-primary hover:bg-transparent hover:text-primary/80" variant="ghost"><Link href={`/career-paths/${path.slug}`}>Explore this route <ArrowRight /></Link></Button>
            </article>)}
          </div>
        </section>

        <section className="border-t border-border bg-[linear-gradient(135deg,#075f61_0%,#144f7e_100%)] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><div className="flex items-center gap-2 text-teal-100"><Sparkles className="size-4" /><p className="text-sm font-semibold">A clearer starting point</p></div><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Career decisions deserve more than a list of titles.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">SM VIA helps healthcare professionals investigate the path before they choose the next job, certificate, or degree.</p></div><Button asChild className="h-11 shrink-0 rounded-xl bg-white px-5 text-primary hover:bg-white/90"><Link href="/resources">Explore career resources <ArrowRight /></Link></Button></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function Value({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-border bg-white p-5"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>
}
