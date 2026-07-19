import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  Check,
  ChevronRight,
  HeartPulse,
  MapPin,
  Sparkles,
} from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { SectionHeading } from "@/components/marketing/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  benefits,
  careerPaths,
  employers,
  featuredJobs,
  popularSpecialties,
  resources,
  statistics,
} from "@/lib/marketing-data"

export default function Home() {
  return (
    <div className="min-h-dvh overflow-hidden bg-background">
      <SiteHeader />
      <main id="top">
        <section className="relative isolate border-b border-border bg-[linear-gradient(135deg,#f8fcff_0%,#eef8f8_45%,#f6fbff_100%)]">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-75 [background-image:radial-gradient(circle_at_15%_20%,rgba(108,207,193,0.18),transparent_25%),radial-gradient(circle_at_90%_0%,rgba(77,144,209,0.2),transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <HeartPulse className="size-3.5" />
                Your career, with care
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl">
                A clearer path to a career in care.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Discover meaningful opportunities, trusted organizations, and practical guidance built for healthcare professionals.
              </p>
              <div className="mt-8 max-w-2xl">
                <HeroSearch />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Popular:</span>
                {popularSpecialties.map((specialty) => (
                  <Link className="transition-colors hover:text-primary hover:underline" href="#featured-jobs" key={specialty}>
                    {specialty}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
              <div className="rounded-[2rem] border border-white/90 bg-[#0e416c] p-5 shadow-[0_28px_70px_rgba(15,76,129,0.28)] sm:p-6">
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.07] p-5 text-white backdrop-blur sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/75">Your career navigator</span>
                    <span className="grid size-9 place-items-center rounded-xl bg-white/10">
                      <Sparkles className="size-4 text-teal-200" />
                    </span>
                  </div>
                  <p className="mt-6 text-2xl font-semibold tracking-[-0.045em]">Find opportunities that fit the life you want to build.</p>
                  <div className="mt-7 grid gap-3">
                    {[
                      ["Explore roles", "18 opportunities matched"],
                      ["Build your profile", "Strengthen your visibility"],
                      ["Plan your next step", "Resources for every stage"],
                    ].map(([title, detail], index) => (
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5" key={title}>
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-300/15 text-xs font-bold text-teal-100">0{index + 1}</span>
                        <span>
                          <span className="block text-sm font-semibold">{title}</span>
                          <span className="mt-0.5 block text-xs text-white/65">{detail}</span>
                        </span>
                        <ChevronRight className="ml-auto size-4 text-white/50" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 px-2 pb-1 text-xs text-blue-100/80">
                  <BadgeCheck className="size-4 text-teal-200" />
                  Designed around healthcare careers, not generic listings.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p className="text-sm font-semibold text-muted-foreground">Built for professionals across every stage of care.</p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold tracking-[-0.02em] text-slate-400">
              <span>Hospitals</span>
              <span>Clinics</span>
              <span>Universities</span>
              <span>Recruiters</span>
              <span>Residency programs</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28" id="career-paths">
          <SectionHeading
            eyebrow="Choose your direction"
            title="One portal. Four ways to move forward."
            description="Whether you are looking for a role, building a team, or planning your next milestone, start with the path that fits today."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {careerPaths.map((path) => {
              const Icon = path.icon
              return (
                <Link className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={path.href} key={path.title}>
                  <Card className="h-full border-border/80 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-[0_18px_35px_rgba(15,76,129,0.11)]">
                    <CardContent className="p-6">
                      <div className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{path.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.description}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="border-y border-border bg-muted/45" id="featured-jobs">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Featured opportunities"
                title="Roles with a real sense of direction."
                description="A curated preview of roles that would be available from verified organizations."
              />
              <Button asChild className="h-10 w-fit rounded-xl" variant="outline">
                <Link href="#get-started">Browse all roles <ArrowRight /></Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <Card className="border-border/80 bg-white" key={job.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                        <Building2 className="size-5" />
                      </div>
                      {job.visa && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Visa support</Badge>}
                    </div>
                    <p className="mt-5 text-xs font-bold tracking-[0.12em] text-primary uppercase">{job.specialty}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{job.employer}</p>
                    <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{job.location}</p>
                      <p className="flex items-center gap-2"><span className="grid size-4 place-items-center text-primary">$</span>{job.salary} · {job.type}</p>
                    </div>
                    <Button asChild className="mt-6 h-10 w-full rounded-xl" variant="outline">
                      <Link href="#get-started">View opportunity <ArrowRight /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28" id="employers">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Meet the organizations"
                title="Explore workplaces that take care seriously."
                description="Company profiles are designed to give future candidates a real feeling for the people, opportunities, and values behind each organization."
              />
              <Button asChild className="mt-7 h-11 rounded-xl px-5">
                <Link href="#get-started">Explore organizations <ArrowRight /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {employers.map((employer) => (
                <Card className="border-border/80 bg-white transition-shadow hover:shadow-lg" key={employer.name}>
                  <CardContent className="p-5 sm:p-6">
                    <span className={`grid size-11 place-items-center rounded-xl text-sm font-bold ${employer.tone}`}>
                      {employer.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                    </span>
                    <h3 className="mt-5 text-base font-semibold tracking-[-0.03em]">{employer.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{employer.openings} open roles</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="size-4" /> Verified organization
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-20 text-white lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Why USHCE"
              title="A more human approach to healthcare careers."
              description="We are building tools that make important decisions feel less overwhelming and more informed."
              tone="inverted"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6" key={benefit.title}>
                    <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-teal-200"><Icon className="size-5" /></div>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-blue-100/80">{benefit.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border px-5 sm:grid-cols-4 sm:divide-y-0 lg:px-8">
            {statistics.map((statistic) => (
              <div className="px-5 py-8 text-center sm:px-8 sm:py-11" key={statistic.label}>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">{statistic.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{statistic.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28" id="resources">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Career resources"
              title="Practical guidance for the road ahead."
              description="Education, insights, and tools created around the realities of healthcare careers."
            />
            <Button asChild className="h-10 w-fit rounded-xl" variant="outline">
              <Link href="#get-started">View all resources <ArrowRight /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {resources.map((resource) => (
              <Link className="group" href="#get-started" key={resource.title}>
                <Card className="h-full overflow-hidden border-border/80 bg-white transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className={`h-40 bg-gradient-to-br ${resource.color} p-5`}>
                    <span className="grid size-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-primary shadow-sm"><Bot className="size-5" /></span>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">{resource.category}</p>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em]">{resource.title}</h3>
                    <p className="mt-4 text-sm text-muted-foreground">{resource.readTime}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Read guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28" id="get-started">
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(115deg,#0f4c81_0%,#126174_100%)] px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute right-0 bottom-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full border-[34px] border-teal-200/10" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-teal-100 uppercase">Early access</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Be first to know when USHCE opens its doors.</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-blue-100/85">Get launch updates, thoughtful career resources, and a first look at the portal.</p>
              </div>
              <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
                <Input aria-label="Email address" className="h-12 border-white/20 bg-white text-foreground placeholder:text-muted-foreground" placeholder="Your email address" type="email" />
                <Button className="h-12 rounded-xl bg-teal-300 px-5 font-semibold text-primary hover:bg-teal-200">Join the list <ArrowRight /></Button>
              </form>
            </div>
            <p className="relative mt-4 flex items-center gap-2 text-xs text-blue-100/70"><Check className="size-3.5" /> No spam. Just a helpful note when there is something worth sharing.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
