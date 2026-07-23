import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, MapPin, ShieldCheck } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { employers } from "@/lib/marketing-data"

export const metadata: Metadata = {
  title: "Healthcare Organizations",
  description:
    "Explore the USHCE product preview for U.S. healthcare organization profiles.",
}

export default function CompaniesPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f8fcff_0%,#eef8f8_50%,#f7fbff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8 lg:py-20">
            <Badge variant="outline">Product preview</Badge>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Learn about the organization before you apply.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              USHCE profiles will bring workplace context, locations, benefits,
              specialties, and active opportunities into one clear view.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            These organizations are fictional product-preview profiles. Verified
            employer data will be clearly identified when the marketplace is live.
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {employers.map((employer) => (
              <Card className="border-border/80 bg-white" key={employer.slug}>
                <CardContent className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold ${employer.tone}`}
                    >
                      {employer.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <Badge variant="outline">Product preview</Badge>
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
                    {employer.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="size-4" />
                      {employer.type}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4" />
                      {employer.location}
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    {employer.description}
                  </p>
                  <Button asChild className="mt-6 rounded-xl" variant="outline">
                    <Link href={`/jobs?query=${encodeURIComponent(employer.name)}`}>
                      View {employer.openings} preview{" "}
                      {employer.openings === 1 ? "role" : "roles"}
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
