import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ChartNoAxesCombined, Landmark, MapPin, ShieldCheck } from "lucide-react"
import { notFound } from "next/navigation"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { getUsaJobsHealthcareOpportunities } from "@/lib/jobs/usajobs"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import { licensureStates } from "@/lib/resources/licensure-states"
import { formatSalary, getRelatedSalaryOccupations, getSalaryOccupation, getSalaryState, salarySource } from "@/lib/salary/data"

type PageProps = { params: Promise<{ profession: string; state: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { profession, state } = await params
  const occupation = getSalaryOccupation(profession)
  const salaryState = getSalaryState(state)
  if (!occupation || !salaryState) return {}
  const stateMedian = occupation.stateMedianAnnual[salaryState.code]
  return {
    title: `${occupation.name} Salary in ${salaryState.name}`,
    description: `Explore the ${salarySource.release} BLS median annual wage estimate for ${occupation.name}s in ${salaryState.name}, plus national benchmarks and related SM VIA jobs.`,
    alternates: { canonical: `/salary/${occupation.slug}/${salaryState.code.toLowerCase()}` },
    robots: stateMedian ? undefined : { index: false, follow: true },
  }
}

export default async function SalaryProfilePage({ params }: PageProps) {
  const { profession, state } = await params
  const occupation = getSalaryOccupation(profession)
  const salaryState = getSalaryState(state)
  if (!occupation || !salaryState) notFound()

  const stateMedian = occupation.stateMedianAnnual[salaryState.code]
  const national = occupation.national
  const jobHref = `/jobs?query=${encodeURIComponent(occupation.name)}&state=${salaryState.code}`
  const hasStateMedian = Boolean(stateMedian)
  const licensureGuide = licensureStates.find(
    (item) => item.abbreviation === salaryState.code,
  )
  const relatedOccupations = getRelatedSalaryOccupations(occupation)
  const [liveJobs, usaJobs, organizations] = await Promise.all([
    getPublishedJobs(),
    getUsaJobsHealthcareOpportunities(),
    getPublicOrganizations(),
  ])
  const stateJobs = [...liveJobs, ...usaJobs]
    .filter((job) => job.stateCode === salaryState.code)
    .sort((left, right) => Number(matchesOccupation(right, occupation.name)) - Number(matchesOccupation(left, occupation.name)))
    .slice(0, 3)
  const stateOrganizations = organizations
    .filter((organization) => organization.location === salaryState.name)
    .slice(0, 3)
  const nationalDifference = stateMedian && national.median
    ? Math.round(((stateMedian - national.median) / national.median) * 100)
    : null

  return (
    <div className="min-h-dvh bg-background"><SiteHeader /><main>
      <section className="border-b border-border bg-[linear-gradient(135deg,#f5fbff_0%,#ebf7f6_52%,#f8fcff_100%)]"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Button asChild size="sm" variant="ghost"><Link href="/salary"><ArrowLeft />Salary hub</Link></Button><Badge className="mt-7" variant="outline">{salarySource.release} BLS data</Badge><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{occupation.name} salary in {salaryState.name}.</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">Use this state benchmark to understand the published market estimate, then assess the specific responsibilities, setting, schedule, and benefits in each live role.</p></div></section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-3xl bg-primary p-7 text-primary-foreground sm:p-9"><div className="flex items-center gap-3 text-primary-foreground/80"><Landmark className="size-5" /><span className="text-sm font-semibold">Published median annual wage</span></div><p className="mt-6 text-5xl font-semibold tracking-[-0.06em]">{hasStateMedian ? formatSalary(stateMedian) : "Not available"}</p><p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80">{hasStateMedian ? `For ${occupation.name.toLowerCase()}s in ${salaryState.name}. This is a statewide BLS estimate across industries; an individual offer can differ.` : "The current BLS release does not provide a statewide median for this selection. Use the national comparison and the official source while this profile is reviewed."}</p>{nationalDifference !== null && <p className="mt-5 border-t border-white/20 pt-4 text-sm font-medium text-white">{nationalDifference === 0 ? "Matches the national median estimate." : `${Math.abs(nationalDifference)}% ${nationalDifference > 0 ? "above" : "below"} the national median estimate.`}</p>}</article><article className="rounded-3xl border border-border bg-white p-7 sm:p-9"><div className="flex items-center gap-3 text-primary"><ChartNoAxesCombined className="size-5" /><span className="text-sm font-semibold">National comparison</span></div><dl className="mt-6 grid grid-cols-2 gap-5"><Stat label="25th percentile" value={formatSalary(national.p25)} /><Stat label="National median" value={formatSalary(national.median)} /><Stat label="75th percentile" value={formatSalary(national.p75)} /><Stat label="National mean" value={formatSalary(national.mean)} /></dl></article></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-border bg-white p-7"><h2 className="text-xl font-semibold">How to use this {salaryState.name} benchmark</h2><ol className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground"><li><span className="font-semibold text-foreground">1. Compare like with like.</span> Statewide data can combine hospital, outpatient, academic, and other settings.</li><li><span className="font-semibold text-foreground">2. Read the full role.</span> Shift patterns, specialty, experience, licensure, and benefits affect total compensation.</li><li><span className="font-semibold text-foreground">3. Use it as context.</span> It is a starting point for research and a more informed conversation — not a salary guarantee.</li></ol></article><aside className="rounded-2xl border border-teal-700/20 bg-teal-50 p-7"><BriefcaseBusiness className="size-6 text-teal-800" /><h2 className="mt-4 text-xl font-semibold">Explore jobs in {salaryState.name}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Search current healthcare opportunities in this state, including official federal roles where available.</p><Button asChild className="mt-6 bg-teal-700 text-white hover:bg-teal-800"><Link href={jobHref}>Search {occupation.name} jobs <ArrowRight /></Link></Button></aside></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-border bg-white p-7"><div className="flex items-center gap-3"><ShieldCheck className="size-6 text-primary" /><div><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Licensure planning</p><h2 className="mt-1 text-xl font-semibold">Before you accept a role in {salaryState.name}</h2></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">Pay is only one part of readiness. Confirm the authority, pathway, and timing for your exact credential before relying on a start date or offer.</p>{licensureGuide?.guideHref ? <Button asChild className="mt-6" variant="outline"><Link href={licensureGuide.guideHref}>Open {salaryState.name} licensure guide <ArrowRight /></Link></Button> : <Button asChild className="mt-6" variant="outline"><Link href="/resources/licensure">Explore state licensure guidance <ArrowRight /></Link></Button>}</article><aside className="rounded-2xl border border-border bg-white p-7"><div className="flex items-center gap-3"><Building2 className="size-6 text-primary" /><h2 className="text-xl font-semibold">Hiring organizations</h2></div>{stateOrganizations.length ? <ul className="mt-5 grid gap-3">{stateOrganizations.map((organization) => <li key={organization.id}><Link className="group flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-primary/[0.03]" href={`/companies/${organization.slug}`}>{organization.name}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link></li>)}</ul> : <><p className="mt-4 text-sm leading-6 text-muted-foreground">Employer pages appear here as organizations publish live roles in {salaryState.name}.</p><Button asChild className="mt-6" variant="outline"><Link href="/companies">Explore organizations <ArrowRight /></Link></Button></>}</aside></div>
      <section className="mt-10"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Current opportunities</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Healthcare roles in {salaryState.name}</h2></div><Button asChild variant="outline"><Link href={`/jobs?state=${salaryState.code}`}>View all state roles <ArrowRight /></Link></Button></div>{stateJobs.length ? <div className="mt-6 grid gap-4">{stateJobs.map((job) => <JobCard job={job} key={`${job.source}-${job.slug}`} layout="row" />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm leading-6 text-muted-foreground"><MapPin className="mb-3 size-5 text-primary" />No current role is available in the latest marketplace refresh for {salaryState.name}. Browse all current healthcare opportunities or check back as employers and USAJOBS update listings.</div>}</section>
      <section className="mt-12 border-t border-border pt-10"><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Compare related professions</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Related salary benchmarks in {salaryState.name}</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{relatedOccupations.map((related) => <Link className="group rounded-2xl border border-border bg-white p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]" href={`/salary/${related.slug}/${salaryState.code.toLowerCase()}`} key={related.slug}><p className="text-sm font-semibold">{related.name}</p><p className="mt-2 text-sm text-muted-foreground">{formatSalary(related.stateMedianAnnual[salaryState.code])} median estimate</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Compare salary <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span></Link>)}</div></section>
      <p className="mt-10 text-xs leading-5 text-muted-foreground">Source: <a className="font-medium text-primary hover:underline" href={salarySource.url} rel="noreferrer" target="_blank">{salarySource.name}</a>, {salarySource.release}. Data retrieved {salarySource.retrievedAt}.</p></section>
    </main><SiteFooter /></div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tracking-[-0.03em]">{value}</dd></div>
}

function matchesOccupation(job: { profession: string; title: string; specialty: string }, occupationName: string) {
  const value = `${job.profession} ${job.title} ${job.specialty}`.toLocaleLowerCase("en-US")
  const normalizedOccupation = occupationName.toLocaleLowerCase("en-US")
  const aliases: Record<string, string[]> = {
    "physician assistant": ["physician associate"],
    "licensed practical nurse": ["licensed vocational nurse", "practical nurse"],
    "clinical laboratory technologist": ["clinical laboratory scientist"],
  }

  return value.includes(normalizedOccupation) || (aliases[normalizedOccupation] ?? []).some((alias) => value.includes(alias))
}
