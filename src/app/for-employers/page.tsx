import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Building2,
  SearchCheck,
  UsersRound,
} from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "For Healthcare Employers",
  description:
    "See how USHCE is being designed to support healthcare employers and recruiters.",
}

const employerFeatures = [
  {
    title: "Structured job publishing",
    description:
      "Create healthcare-specific listings with specialty, setting, license, schedule, and support details.",
    icon: Building2,
  },
  {
    title: "Focused candidate discovery",
    description:
      "Search candidate profiles using healthcare experience, credentials, and career preferences.",
    icon: SearchCheck,
  },
  {
    title: "Collaborative hiring",
    description:
      "Organize candidates, interviews, internal notes, and recruiter workflows in one workspace.",
    icon: UsersRound,
  },
  {
    title: "Hiring insights",
    description:
      "Understand listing visibility, candidate activity, and recruiting performance.",
    icon: BarChart3,
  },
]

export default function ForEmployersPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="overflow-hidden bg-primary text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <Badge className="border-white/20 bg-white/10 text-white">
                Employer experience preview
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Build a stronger healthcare hiring experience.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/85">
                USHCE is being designed for hospitals, clinics, medical groups,
                academic centers, staffing teams, and healthcare recruiters.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-xl bg-teal-300 px-5 text-primary hover:bg-teal-200"
                >
                  <Link href="/sign-up">
                    Prepare an employer account <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-12 rounded-xl border-white/20 bg-white/10 px-5 text-white hover:bg-white/15"
                  variant="outline"
                >
                  <Link href="/companies">View organization previews</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 backdrop-blur sm:p-7">
              <p className="text-sm font-semibold text-teal-100">
                Planned employer workflow
              </p>
              <ol className="mt-6 grid gap-4">
                {[
                  "Create and verify your organization",
                  "Publish structured healthcare opportunities",
                  "Review qualified candidate profiles",
                  "Coordinate interviews and hiring decisions",
                ].map((item, index) => (
                  <li
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4"
                    key={item}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-300/15 text-sm font-bold text-teal-100">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
              Purpose-built foundation
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Hiring tools shaped around healthcare.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {employerFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card className="border-border/80 bg-white" key={feature.title}>
                  <CardContent className="p-6">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
