import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeDollarSign, BarChart3, Building2, Landmark } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SalaryExplorer } from "@/components/salary/salary-explorer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatSalary, salaryOccupations, salarySource, salaryStates } from "@/lib/salary/data"
import { socialImageMetadata } from "@/components/seo/social-card"

export const metadata: Metadata = {
  title: "Healthcare Salary Hub",
  description: "Compare official BLS healthcare salary estimates by profession and state, then explore relevant opportunities on SM VIA.",
  alternates: { canonical: "/salary" },
  openGraph: { images: socialImageMetadata("/salary/opengraph-image") },
  twitter: { card: "summary_large_image", images: ["/salary/opengraph-image"] },
}

export default function SalaryHubPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-950/10 bg-[linear-gradient(130deg,#0c3155_0%,#165b88_56%,#087e75_100%)] text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <Badge className="border-white/25 bg-white/10 text-white" variant="outline">Official U.S. wage data</Badge>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Healthcare salaries, made easier to compare.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
                  Explore published annual wage estimates for 20 healthcare professions across 20 priority states. Start with a real benchmark, then compare it with current opportunities.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-slate-950/10 p-6">
                <p className="text-sm font-semibold">Why these numbers are different</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">They come from the U.S. Bureau of Labor Statistics — not from anonymous self-reports or job-board estimates.</p>
              </div>
            </div>
            <div className="mt-9"><SalaryExplorer occupations={salaryOccupations} states={salaryStates} /></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-white p-6"><BadgeDollarSign className="size-6 text-primary" /><h2 className="mt-4 text-lg font-semibold">Salary by state</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">See the published median annual wage for a profession in each covered state.</p></article>
            <article className="rounded-2xl border border-border bg-white p-6"><BarChart3 className="size-6 text-primary" /><h2 className="mt-4 text-lg font-semibold">National context</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Compare a state benchmark with national mean, median, and percentile estimates.</p></article>
            <article className="rounded-2xl border border-border bg-white p-6"><Building2 className="size-6 text-primary" /><h2 className="mt-4 text-lg font-semibold">Next: real roles</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Each profile points to SM VIA job search for that profession and state.</p></article>
          </div>

          <div className="mt-14 flex items-end justify-between gap-6"><div><p className="text-xs font-bold tracking-[0.13em] text-primary uppercase">Explore a profession</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">20 healthcare salary profiles</h2></div><p className="hidden text-sm text-muted-foreground sm:block">Choose a profile, then select a state.</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {salaryOccupations.map((occupation) => (
              <Link className="group rounded-2xl border border-border bg-white p-5 transition-colors hover:border-primary hover:bg-primary/[0.025]" href={`/salary/${occupation.slug}/fl`} key={occupation.slug}>
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Landmark className="size-5" /></span>
                <h3 className="mt-5 font-semibold">{occupation.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{occupation.national.median ? <>U.S. median: <span className="font-semibold text-foreground">{formatSalary(occupation.national.median)}</span></> : "Current BLS value being aligned"}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore by state <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/35"><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm"><Landmark className="size-5" /></span><div><h2 className="text-lg font-semibold">About the data</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">Source: <a className="font-medium text-primary hover:underline" href={salarySource.url} rel="noreferrer" target="_blank">{salarySource.name}</a>, {salarySource.release}. Annual wage estimates reflect wage and salary workers and are a market benchmark — not a promised salary or an individual offer. Data retrieved {salarySource.retrievedAt}.</p></div></div></div></section>

        <section className="mx-auto max-w-7xl px-5 py-14 text-center lg:px-8"><h2 className="text-3xl font-semibold tracking-[-0.045em]">Ready to compare the market with live opportunities?</h2><Button asChild className="mt-6 h-11 rounded-xl px-5"><Link href="/jobs">Search healthcare jobs <ArrowRight /></Link></Button></section>
      </main>
      <SiteFooter />
    </div>
  )
}
