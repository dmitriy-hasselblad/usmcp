import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  HeartPulse,
  MapPinned,
  Route,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { CareerNavigator } from "@/components/marketing/career-navigator"
import { HeroSearch } from "@/components/marketing/hero-search"
import { SectionHeading } from "@/components/marketing/section-heading"
import { OrganizationCard } from "@/components/organizations/organization-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usStates } from "@/lib/auth/validation"
import { healthcareTaxonomy } from "@/lib/healthcare-taxonomy"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import healthcareTeamImage from "../../public/images/ushce-healthcare-team.png"
import { popularSpecialties } from "@/lib/marketing-data"
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
  const stateSummaries = getStateSummaries(liveJobs)

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
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ["Specialty", "/jobs"],
                  ["License state", "/jobs"],
                  ["Visa support", "/jobs?visa=true"],
                  ["Salary", "/jobs"],
                  ["Residency", "/resources#residency"],
                ].map(([label, href]) => (
                  <Link className="rounded-full border border-primary/15 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/35 hover:bg-white" href={href} key={label}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
              <CareerNavigator />
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4"><Route className="size-6 shrink-0 text-teal-700" /><p className="text-sm font-semibold text-foreground">Built specifically for U.S. healthcare careers</p></div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground"><span>50 states</span><span className="text-teal-600">●</span><span>Healthcare-only taxonomy</span><span className="text-teal-600">●</span><span>Licensure-aware profiles</span><span className="text-teal-600">●</span><span>International career pathways</span></div>
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
            {featuredMarketplaceJobs.length ? <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <JobCard job={featuredMarketplaceJobs[0]} />
              <Card className="border-primary/15 bg-[linear-gradient(135deg,#f8fcff_0%,#edf9f8_100%)]"><CardContent className="flex h-full flex-col justify-center p-7 sm:p-9"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Stethoscope className="size-6" /></span><p className="mt-6 text-xs font-bold tracking-[0.14em] text-primary uppercase">Profile-powered discovery</p><h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.05em]">Your next opportunity starts with your profile.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Add your specialty, licenses, certifications, experience, location, and career preferences to make your search more relevant as the marketplace grows.</p><Button asChild className="mt-7 w-fit rounded-xl"><Link href="/dashboard/profile">Build your professional profile <ArrowRight /></Link></Button></CardContent></Card>
            </div> : <Card className="mt-10 border-dashed bg-white"><CardContent className="grid gap-6 p-8 sm:grid-cols-[auto_1fr] sm:items-center"><span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Stethoscope className="size-7" /></span><div><h2 className="text-xl font-semibold">Your next opportunity starts with your profile.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Build a professional profile around your specialty, licenses, certifications, experience, location, and visa requirements while the marketplace grows.</p><Button asChild className="mt-5" variant="outline"><Link href="/dashboard/profile">Build your professional profile <ArrowRight /></Link></Button></div></CardContent></Card>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28" id="careers">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start"><SectionHeading eyebrow="Explore healthcare careers" title="Start with your discipline, then follow your path." description="SM VIA organizes healthcare work around focused professions and specialties—not a generic list of job titles." /><div className="grid gap-3 sm:grid-cols-2">{healthcareTaxonomy.slice(0, 8).map((category) => { const firstProfession = category.professions[0]?.name; return <Link className="group rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg" href={firstProfession ? `/jobs?profession=${encodeURIComponent(firstProfession)}` : "/jobs"} key={category.name}><p className="text-base font-semibold">{category.name}</p><p className="mt-2 text-sm text-muted-foreground">{category.professions.slice(0, 3).map((profession) => profession.name).join(" · ")}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore roles <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></Link> })}</div></div>
        </section>

        <section className="border-y border-border bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow="U.S. opportunity map" title="Explore healthcare opportunities by state." description="Search roles by state now. Licensure guidance and deeper state context can grow alongside the marketplace." /><MapPinned className="size-10 text-teal-700" /></div>{stateSummaries.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stateSummaries.map((item) => <Link className="rounded-2xl border border-border bg-white p-5 transition hover:border-primary/30 hover:shadow-lg" href={`/jobs?state=${item.code}`} key={item.code}><p className="text-lg font-semibold">{item.name}</p><p className="mt-2 text-sm text-muted-foreground">{item.count} {item.count === 1 ? "live opportunity" : "live opportunities"}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore {item.code} <ArrowRight className="size-4" /></span></Link>)}</div> : <Card className="mt-10 border-dashed bg-white"><CardContent className="p-7"><p className="font-semibold">The marketplace is built for all 50 states.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">As organizations publish opportunities, state-by-state exploration will appear here with real counts and direct search links.</p></CardContent></Card>}</div>
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
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8"><div><p className="text-xs font-bold tracking-[0.15em] text-teal-200 uppercase">Why SM VIA</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Healthcare careers need more than a generic job board.</h2><p className="mt-5 max-w-xl text-base leading-8 text-blue-100/85">SM VIA structures healthcare experience, licenses, certifications, training, and career goals so professionals can present their background clearly and employers can understand it faster.</p><Button asChild className="mt-8 rounded-xl bg-white text-primary hover:bg-white/90"><Link href="/dashboard/profile">Build your professional profile <ArrowRight /></Link></Button></div><div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl sm:p-7"><div className="rounded-[1.4rem] bg-white p-6 text-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Illustrative profile</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Professional readiness</h3></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">Private by default</span></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-teal-600" /></div><div className="mt-6 grid gap-3 text-sm">{["Licensure and credentials", "Education and clinical training", "Experience and specialty", "Location and career preferences"].map((item) => <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3" key={item}><CheckCircle2 className="size-5 text-teal-700" />{item}</div>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">The profile is a product illustration. Members decide what information to add and share.</p></div></div></div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><p className="text-center text-xs font-bold tracking-[0.15em] text-primary uppercase">SM VIA Path Line</p><div className="mt-8 grid gap-5 sm:grid-cols-5 sm:gap-0">{["Profile", "License", "Career", "Employer", "Growth"].map((item, index) => <div className="relative flex items-center gap-3 sm:flex-col sm:text-center" key={item}><span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-teal-600 bg-white text-xs font-bold text-teal-800">0{index + 1}</span>{index < 4 && <span className="absolute left-9 top-4 h-px w-7 bg-teal-300 sm:left-[calc(50%+1.2rem)] sm:top-4 sm:w-[calc(100%-2.4rem)]" />}<span className="text-sm font-semibold text-foreground">{item}</span></div>)}</div></div>
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

function getStateSummaries(
  jobs: Awaited<ReturnType<typeof getPublishedJobs>>,
) {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    if (job.stateCode) {
      counts.set(job.stateCode, (counts.get(job.stateCode) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([code, count]) => ({
      code,
      count,
      name: usStates.find(([stateCode]) => stateCode === code)?.[1] ?? code,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en-US"))
    .slice(0, 4)
}
