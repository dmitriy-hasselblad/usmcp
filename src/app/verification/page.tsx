import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Organization verification",
  description: "Learn what the SM VIA Verified organization badge means during Early Access.",
}

const reviewSteps = [
  "The organization identity and public organization details are reviewed.",
  "Its public website or contact information is reviewed for consistency.",
  "Evidence is reviewed that it represents a real U.S. healthcare employer or healthcare organization.",
]

export default function VerificationPage() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800" variant="outline">
              Verified organization
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              What verification means on SM VIA.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              During Early Access, this badge means SM VIA completed a manual review of an organization&apos;s identity and public information before displaying the verified signal.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl gap-6 px-5 py-12 lg:px-8 lg:py-16">
          <Card className="bg-white">
            <CardContent className="p-7 sm:p-8">
              <ShieldCheck className="size-7 text-primary" />
              <h2 className="mt-5 text-2xl font-semibold">What SM VIA reviews</h2>
              <ul className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground">
                {reviewSteps.map((step) => (
                  <li className="flex gap-3" key={step}>
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold">What it does not guarantee</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Verification does not guarantee a job&apos;s quality, a hiring outcome, a response from an employer, compensation, workplace conditions, or clinical quality. Professionals should review every opportunity carefully before applying.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold">Unverified organizations</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                An organization without this badge is shown neutrally. It may be new to SM VIA, awaiting review, or not yet eligible for verification. The absence of a badge is not a negative rating.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl"><Link href="/companies">Explore organizations</Link></Button>
            <Button asChild className="rounded-xl" variant="outline"><Link href="/jobs">Browse jobs</Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
