import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, GraduationCap, Globe2 } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResourceGuideGrid } from "@/components/resources/resource-guide-grid"
import { resourceGuides } from "@/lib/resources/content"

export const metadata: Metadata = {
  title: "Healthcare Career Resources",
  description:
            "Explore the growing SM VIA library for residency planning, employer research, and international healthcare careers.",
  alternates: { canonical: "/resources" },
}

export default function ResourcesPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eff9f7_52%,#f8fcff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <Badge variant="outline">Growing resource library</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Practical guidance for healthcare career decisions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Start with clear, U.S.-focused guidance for professionals,
              residency candidates, and international applicants. New practical
              resources will be added throughout Early Access.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <ResourceGuideGrid resources={resourceGuides} />
        </section>

        <section className="border-y border-border bg-muted/40" id="residency">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div className="rounded-2xl border border-border bg-white p-7">
              <GraduationCap className="size-6 text-primary" />
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                Residency and training
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Planned resources will cover application organization, program
                research, interview preparation, and major training milestones.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-7">
              <Globe2 className="size-6 text-primary" />
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                International career pathways
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Planned guides will help candidates identify questions about
                licensing, credential review, sponsorship, and employer support.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-[-0.05em]">
            Ready to explore opportunities?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Try the first working version of the SM VIA healthcare job search.
          </p>
          <Button asChild className="mt-6 h-11 rounded-xl px-5">
            <Link href="/jobs">
              Search preview roles <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
