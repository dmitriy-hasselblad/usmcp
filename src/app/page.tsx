import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpenText,
  HeartPulse,
  ShieldCheck,
  UsersRound,
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
import { benefits, platformPrinciples, popularSpecialties } from "@/lib/marketing-data"
import { resourceGuides } from "@/lib/resources/content"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

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
        <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#eef5f7]">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_72%_18%,rgba(80,174,198,0.2),transparent_41%),radial-gradient(circle_at_12%_92%,rgba(13,72,119,0.09),transparent_42%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(25rem,0.98fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <HeartPulse className="size-3.5" />
                Built for U.S. healthcare careers
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl">
                Where healthcare talent meets meaningful work.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Discover focused healthcare opportunities, understand the people behind each organization, and move through your next career step with clarity.
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

            <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] border border-white/90 bg-white p-2.5 shadow-[0_30px_80px_rgba(15,76,129,0.2)]">
                <div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.45rem] bg-slate-200">
                  <Image alt="Healthcare professionals collaborating at work" className="object-cover object-[58%_center]" fill placeholder="blur" priority sizes="(min-width: 1024px) 42vw, 100vw" src={healthcareTeamImage} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,42,70,0.02)_37%,rgba(8,42,70,0.76)_100%)]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-slate-950/55 p-4 text-white backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.12em] text-cyan-100 uppercase">Healthcare, in motion</p>
                        <p className="mt-1.5 text-lg font-semibold tracking-[-0.035em]">Built around real teams and real career paths.</p>
                      </div>
                      <UsersRound className="size-7 shrink-0 text-cyan-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
            <Link className="group py-7 sm:px-7 sm:first:pl-0" href="/jobs">
              <HeartPulse className="size-5 text-primary" />
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-slate-950">Healthcare professionals</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">Find work that reflects your specialty and career direction.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore roles <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
            <Link className="group py-7 sm:px-7" href="/for-employers">
              <ShieldCheck className="size-5 text-primary" />
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-slate-950">Healthcare employers</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">Create a clear presence for the teams and roles you are building.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">For employers <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
            <Link className="group py-7 sm:px-7 sm:last:pr-0" href="/resources">
              <BookOpenText className="size-5 text-primary" />
              <p className="mt-4 text-base font-semibold tracking-[-0.025em] text-slate-950">Career transitions</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">Use focused guidance for residency, licensing, and next steps.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore guidance <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </section>

        <section className="bg-white" id="featured-jobs">
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
              eyebrow="Why SM VIA"
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
