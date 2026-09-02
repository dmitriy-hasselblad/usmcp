import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, Landmark } from "lucide-react"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatSalary, getSalaryOccupation, getSalaryState, salarySource } from "@/lib/salary/data"

type PageProps = { params: Promise<{ profession: string; state: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { profession, state } = await params
  const occupation = getSalaryOccupation(profession)
  const salaryState = getSalaryState(state)
  if (!occupation || !salaryState) return {}
  return {
    title: `${occupation.name} Salary in ${salaryState.name}`,
    description: `Explore the ${salarySource.release} BLS median annual wage estimate for ${occupation.name}s in ${salaryState.name}, plus national benchmarks and related SM VIA jobs.`,
    alternates: { canonical: `/salary/${occupation.slug}/${salaryState.code.toLowerCase()}` },
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

  return (
    <div className="min-h-dvh bg-background"><SiteHeader /><main>
      <section className="border-b border-border bg-[linear-gradient(135deg,#f5fbff_0%,#ebf7f6_52%,#f8fcff_100%)]"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Button asChild size="sm" variant="ghost"><Link href="/salary"><ArrowLeft />Salary hub</Link></Button><Badge className="mt-7" variant="outline">{salarySource.release} BLS data</Badge><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{occupation.name} salary in {salaryState.name}.</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">Use this state benchmark to understand the published market estimate, then assess the specific responsibilities, setting, schedule, and benefits in each live role.</p></div></section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-3xl bg-primary p-7 text-primary-foreground sm:p-9"><div className="flex items-center gap-3 text-primary-foreground/80"><Landmark className="size-5" /><span className="text-sm font-semibold">Published median annual wage</span></div><p className="mt-6 text-5xl font-semibold tracking-[-0.06em]">{hasStateMedian ? formatSalary(stateMedian) : "Not available"}</p><p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80">{hasStateMedian ? `For ${occupation.name.toLowerCase()}s in ${salaryState.name}. This is a statewide BLS estimate across industries; an individual offer can differ.` : "The current BLS release does not provide a statewide median for this selection. Use the national comparison and the official source while this profile is reviewed."}</p></article><article className="rounded-3xl border border-border bg-white p-7 sm:p-9"><div className="flex items-center gap-3 text-primary"><ChartNoAxesCombined className="size-5" /><span className="text-sm font-semibold">National comparison</span></div><dl className="mt-6 grid grid-cols-2 gap-5"><Stat label="25th percentile" value={formatSalary(national.p25)} /><Stat label="National median" value={formatSalary(national.median)} /><Stat label="75th percentile" value={formatSalary(national.p75)} /><Stat label="National mean" value={formatSalary(national.mean)} /></dl></article></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-border bg-white p-7"><h2 className="text-xl font-semibold">How to use this number</h2><ol className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground"><li><span className="font-semibold text-foreground">1. Compare like with like.</span> Statewide data can combine hospital, outpatient, academic, and other settings.</li><li><span className="font-semibold text-foreground">2. Read the full role.</span> Shift patterns, specialty, experience, licensure, and benefits affect total compensation.</li><li><span className="font-semibold text-foreground">3. Use it as context.</span> It is a starting point for research and a more informed conversation — not a salary guarantee.</li></ol></article><aside className="rounded-2xl border border-teal-700/20 bg-teal-50 p-7"><BriefcaseBusiness className="size-6 text-teal-800" /><h2 className="mt-4 text-xl font-semibold">Explore relevant jobs</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">See current SM VIA roles filtered for {salaryState.name}. Availability changes as employers publish and close positions.</p><Button asChild className="mt-6 bg-teal-700 text-white hover:bg-teal-800"><Link href={jobHref}>Search jobs in {salaryState.code} <ArrowRight /></Link></Button></aside></div>
      <p className="mt-10 text-xs leading-5 text-muted-foreground">Source: <a className="font-medium text-primary hover:underline" href={salarySource.url} rel="noreferrer" target="_blank">{salarySource.name}</a>, {salarySource.release}. Data retrieved {salarySource.retrievedAt}.</p></section>
    </main><SiteFooter /></div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tracking-[-0.03em]">{value}</dd></div>
}
