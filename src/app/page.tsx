import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { SectionHeading } from "@/components/marketing/section-heading"
import { OrganizationCard } from "@/components/organizations/organization-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import healthcareTeamImage from "../../public/images/ushce-healthcare-team.png"
import { benefits, careerPaths, platformPrinciples, popularSpecialties } from "@/lib/marketing-data"
import { resourceGuides } from "@/lib/resources/content"

export default async function Home() {
  const [liveJobs, publicOrganizations] = await Promise.all([
    getPublishedJobs(),
    getPublicOrganizations(),
  ])
  const featuredMarketplaceJobs = liveJobs.slice(0, 3)

  return (
    <div className="min-h-dvh overflow-hidden bg-background">
      <SiteHeader />
      <main id="top">
        <section className="relative isolate overflow-hidden border-b border-border bg-slate-100">
          <Image
            alt=""
            aria-hidden="true"
            className="-z-20 object-cover object-[58%_center]"
            fill
            placeholder="blur"
            priority
            sizes="100vw"
            src={healthcareTeamImage}
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,252,255,0.98)_0%,rgba(248,252,255,0.94)_36%,rgba(238,248,248,0.54)_62%,rgba(8,42,70,0.18)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(248,252,255,0.97)_0%,rgba(248,252,255,0.92)_48%,rgba(15,76,129,0.3)_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <HeartPulse className="size-3.5" />
                Built for U.S. healthcare careers
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl">
                Build your healthcare career in the U.S.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Search focused healthcare opportunities, learn about employers,
                and plan your next professional step in one clear ecosystem.
              </p>
              <div className="mt-8 max-w-2xl">
                <HeroSearch />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Popular:</span>
                {popularSpecialties.map((specialty) => (
                  <Link
                    className="transition-colors hover:text-primary hover:underline"
                    href={`/jobs?query=${encodeURIComponent(specialty)}`}
                    key={specialty}
                  >
                    {specialty}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
              <div className="rounded-[2rem] border border-white/80 bg-[#0e416c]/95 p-5 shadow-[0_28px_70px_rgba(15,76,129,0.32)] backdrop-blur-sm sm:p-6">
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.07] p-5 text-white backdrop-blur sm:p-6">
                  <p className="text-sm font-medium text-white/70">
                    Start with your goal
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.045em]">
                    One ecosystem, built around the healthcare career journey.
                  </p>
                  <div className="mt-7 grid gap-3">
                    {careerPaths.map((path, index) => (
                      <Link
                        className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:bg-white/[0.11]"
                        href={path.href}
                        key={path.title}
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-300/15 text-xs font-bold text-teal-100">
                          0{index + 1}
                        </span>
                        <span className="text-sm font-semibold">{path.title}</span>
                        <ChevronRight className="ml-auto size-4 text-white/50 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 px-2 pb-1 text-xs text-blue-100/80">
                  <ShieldCheck className="size-4 text-teal-200" />
                  Published jobs are live and ready to explore.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p className="text-sm font-semibold text-muted-foreground">
              Designed for the people and organizations behind U.S. healthcare.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold tracking-[-0.02em] text-slate-400">
              <span>Healthcare professionals</span>
              <span>Hospitals and clinics</span>
              <span>Recruiters</span>
              <span>Residency candidates</span>
              <span>International professionals</span>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/45" id="featured-jobs">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Live opportunities"
                title="Explore newly published healthcare opportunities."
                description="Browse employer-published roles from organizations building their teams on SM VIA."
              />
              <Button asChild className="h-10 w-fit rounded-xl" variant="outline">
                <Link href="/jobs">
                  Browse all roles <ArrowRight />
                </Link>
              </Button>
            </div>
            {featuredMarketplaceJobs.length ? <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {featuredMarketplaceJobs.map((job) => <JobCard job={job} key={job.slug} />)}
            </div> : <Card className="mt-10 border-dashed bg-white"><CardContent className="p-8 text-center"><h2 className="text-xl font-semibold">New opportunities are coming soon.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Check back as verified employers publish roles, or explore the product-preview experience from the jobs page.</p><Button asChild className="mt-5" variant="outline"><Link href="/jobs?preview=true">View product previews</Link></Button></CardContent></Card>}
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
          id="employers"
        >
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Organization profiles"
                title="Understand the workplace before you apply."
                description="SM VIA employer profiles are designed to bring together culture, care settings, locations, benefits, and open roles."
              />
              <Button asChild className="mt-7 h-11 rounded-xl px-5">
                <Link href="/companies">
                  Explore healthcare organizations <ArrowRight />
                </Link>
              </Button>
            </div>
            {publicOrganizations.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {publicOrganizations.slice(0, 4).map((organization) => (
                  <OrganizationCard
                    compact
                    key={organization.id}
                    organization={organization}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border/80 bg-white">
                <CardContent className="p-7 sm:p-8">
                  <ShieldCheck className="size-7 text-primary" />
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                    Live organization profiles are coming online.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Organizations will appear here after they publish an active
                    healthcare opportunity on SM VIA.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="bg-primary py-20 text-white lg:py-28" id="why-smvia">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="SM VIA · Specialized Medical Vocations & Industry Alliance"
              title="Healthcare careers need more than a generic job board."
              description="The platform brings the real structure of healthcare careers and hiring into one secure workflow."
              tone="inverted"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div
                    className="rounded-2xl border border-white/15 bg-white/[0.07] p-6"
                    key={benefit.title}
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-teal-200">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em]">
                      {benefit.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-blue-100/80">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-7xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {platformPrinciples.map((principle) => (
              <div className="bg-white px-7 py-9" key={principle.value}>
                <p className="text-lg font-semibold tracking-[-0.03em] text-primary">
                  {principle.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {principle.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
          id="resources"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Career resources"
              title="Practical guidance for the road ahead."
              description="Explore focused introductions to residency planning, employer research, and international healthcare careers."
            />
            <Button asChild className="h-10 w-fit rounded-xl" variant="outline">
              <Link href="/resources">
                View all resources <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {resourceGuides.map((resource) => (
              <Link
                className="group"
                href={`/resources/${resource.slug}`}
                key={resource.slug}
              >
                <Card className="h-full overflow-hidden border-border/80 bg-white transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <Image
                      alt={resource.image.alt}
                      className="object-cover"
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      src={resource.image.src}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-white/5" />
                    <span className="absolute left-5 top-5 grid size-10 place-items-center rounded-xl border border-white/80 bg-white/90 text-primary shadow-sm">
                      <BookOpenText className="size-5" />
                    </span>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
                      {resource.category}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em]">
                      {resource.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {resource.description}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {resource.readTime}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Read guide
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}
