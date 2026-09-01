import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPinned, ShieldCheck } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { licensureStates } from "@/lib/resources/licensure-states"

export const metadata: Metadata = {
  title: "Healthcare Licensure by State",
  description:
    "Find state-specific healthcare licensure guidance and official resources, beginning with carefully reviewed sources.",
  alternates: { canonical: "/resources/licensure" },
}

export default function LicensureByStatePage() {
  const publishedStates = licensureStates.filter((state) => state.guideHref).length

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eff9f7_52%,#f8fcff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
            <Button asChild size="sm" variant="ghost">
              <Link href="/resources"><ArrowLeft />All resources</Link>
            </Button>
            <Badge className="mt-7" variant="outline">U.S. healthcare licensure</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Find licensure guidance by state.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              Choose a state to find carefully reviewed, official starting points for healthcare licensure research. Requirements are profession- and pathway-specific, so each guide links you back to the relevant authority.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6 sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm"><ShieldCheck className="size-5" /></span>
              <div>
                <h2 className="text-lg font-semibold">Official sources, not generic advice</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  We publish a state guide only after its official sources are reviewed. This avoids presenting outdated or incomplete requirements as a personal licensing decision.
                </p>
              </div>
            </div>
            <p className="mt-4 shrink-0 text-sm font-medium text-primary sm:mt-1">{publishedStates} of 50 state guides published</p>
          </div>

          <div className="mt-10 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-primary uppercase">State directory</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Choose a state</h2>
            </div>
            <p className="hidden text-sm text-muted-foreground sm:block">More state guides are added after source review.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {licensureStates.map((state) => state.guideHref ? (
              <Link className="group rounded-2xl border border-primary/30 bg-white p-5 transition-colors hover:border-primary hover:bg-primary/[0.03]" href={state.guideHref} key={state.slug}>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{state.abbreviation}</span>
                  <ArrowRight className="mt-1 size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-5 font-semibold">{state.name}</h3>
                <p className="mt-1 text-sm text-primary">Guide and official resources</p>
              </Link>
            ) : (
              <article className="rounded-2xl border border-border bg-white p-5" key={state.slug}>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-sm font-bold text-foreground">{state.abbreviation}</span>
                  <MapPinned className="mt-1 size-4 text-muted-foreground" />
                </div>
                <h3 className="mt-5 font-semibold">{state.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Official sources in review</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
