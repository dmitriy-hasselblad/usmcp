import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpenText,
  Building2,
  Check,
  CircleCheckBig,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { Button } from "@/components/ui/button"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import type { Job } from "@/lib/marketing-data"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import { resourceGuides } from "@/lib/resources/content"

export const metadata: Metadata = { alternates: { canonical: "/" } }

const goals = [
  { code: "01", title: "Find healthcare jobs", description: "Search focused opportunities across specialties and settings.", href: "/jobs", icon: Search },
  { code: "02", title: "Hire healthcare professionals", description: "Post roles and review candidates with dedicated tools.", href: "/for-employers", icon: Building2 },
  { code: "03", title: "Explore residency & training", description: "Plan your next step with structured, practical guidance.", href: "/resources", icon: GraduationCap },
  { code: "04", title: "Find visa-supporting roles", description: "Filter opportunities by sponsorship and eligibility.", href: "/jobs?visa=true", icon: Landmark },
]

const pathSteps = [
  { code: "01", title: "Build your profile", description: "Create a focused healthcare profile and keep your career details private by default.", href: "/sign-up" },
  { code: "02", title: "Search & match", description: "Explore roles by specialty, state, care setting, and visa support.", href: "/jobs" },
  { code: "03", title: "Apply with context", description: "Review organizations, communicate securely, and track every application.", href: "/dashboard" },
  { code: "04", title: "Move forward", description: "Manage interviews and decisions with a clear record of each next step.", href: "/resources" },
]

function JobRow({ job, index }: { job: Job; index: number }) {
  return (
    <Link className="group grid gap-4 border-b border-[#dcd8cc] px-5 py-5 transition-colors hover:bg-[#f1f5f2] sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center sm:px-6" href={`/jobs/${job.slug}`}>
      <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#dceae5] font-mono text-xs font-bold text-[#0e6e5c]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate font-semibold text-[#081d30]">{job.title}</p><p className="mt-0.5 truncate text-sm text-[#4a564f]">{job.employer}</p></div></div>
      <p className="flex items-center gap-1.5 text-sm text-[#4a564f]"><MapPin className="size-4 text-[#0e6e5c]" />{job.location}</p>
      <p className="text-sm text-[#4a564f]">{job.type} · {job.setting}</p>
      <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="font-mono text-sm font-medium text-[#081d30]">{job.salary}</span><ArrowRight className="size-4 text-[#0e6e5c] transition-transform group-hover:translate-x-1" /></div>
    </Link>
  )
}

export default async function Home() {
  const [liveJobs, organizations] = await Promise.all([getPublishedJobs(), getPublicOrganizations()])
  const featuredJobs = liveJobs.slice(0, 3)

  return (
    <div className="min-h-dvh overflow-hidden bg-[#f6f5f1] text-[#151e1b]">
      <SiteHeader />
      <main id="top">
        <section className="border-b border-[#dcd8cc]">
          <div className="mx-auto grid max-w-[74rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[.08em] text-[#0e6e5c] uppercase"><span className="size-1.5 rounded-full bg-[#c6963f]" />Built for U.S. healthcare careers</p>
              <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-fraunces)] text-5xl leading-[.98] font-semibold tracking-[-.045em] text-[#081d30] sm:text-6xl lg:text-7xl">Build your career in <em className="font-medium text-[#0e6e5c]">healthcare</em> in the U.S.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#4a564f]">Verified opportunities, transparent employers, and a clearer path from your profile to the next meaningful role.</p>
              <div className="mt-8 max-w-2xl"><HeroSearch /></div>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#4a564f]"><span className="mr-1 font-medium">Popular:</span>{["Cardiology", "Internal Medicine", "Radiology", "Nursing"].map((item) => <Link className="rounded-full bg-[#dceae5] px-3 py-1.5 font-medium text-[#0e6e5c] transition-colors hover:bg-[#c6dfd6]" href={`/jobs?query=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</div>
            </div>

            <div className="relative mx-auto h-[27rem] w-full max-w-md sm:h-[29rem]">
              <div className="absolute left-0 top-0 w-[72%] rounded-2xl border border-[#dcd8cc] bg-white p-5 shadow-[0_20px_50px_-18px_rgba(11,42,69,.28)]">
                <div className="flex items-center justify-between"><span className="rounded-full bg-[#dceae5] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[.06em] text-[#0e6e5c] uppercase">Career profile</span><span className="size-2 rounded-full bg-[#0e6e5c]" /></div><p className="mt-5 font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[#081d30]">Your direction, clearly presented.</p><p className="mt-1 text-sm text-[#4a564f]">Private by default · Shared on your terms</p><div className="mt-5 h-1 rounded-full bg-[#efede6]"><div className="h-full w-3/4 rounded-full bg-[#0e6e5c]" /></div>
              </div>
              <div className="absolute right-0 top-32 z-10 w-[76%] rounded-2xl bg-[#081d30] p-5 text-white shadow-[0_20px_50px_-18px_rgba(11,42,69,.36)]"><span className="rounded-full bg-[#f3e7ce] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[.06em] text-[#8a6420] uppercase">Career pathway</span><p className="mt-5 font-[family-name:var(--font-fraunces)] text-xl font-semibold">Explore roles that fit your next step.</p><p className="mt-1 text-sm text-slate-300">Specialty, state, setting, and support.</p><div className="mt-5 h-1 rounded-full bg-white/15"><div className="h-full w-1/2 rounded-full bg-[#c6963f]" /></div></div>
              <div className="absolute bottom-0 left-5 w-[68%] rounded-2xl border border-[#dcd8cc] bg-white p-5 shadow-[0_20px_50px_-18px_rgba(11,42,69,.22)]"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#dceae5] text-[#0e6e5c]"><CircleCheckBig className="size-5" /></span><div><p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[#081d30]">Employer context</p><p className="text-sm text-[#4a564f]">Understand the workplace before you apply.</p></div></div></div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#dcd8cc] bg-[#081d30] text-white"><div className="mx-auto grid max-w-[74rem] divide-y divide-white/15 px-5 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-8">{[["Healthcare-only", "Roles, specialties, and settings"], ["U.S.-focused", "States, licensing, and local context"], ["Private by default", "Your profile stays in your control"], ["Built for hiring", "Direct tools for employers and candidates"]].map(([title, detail]) => <div className="py-7 sm:px-6 sm:first:pl-0" key={title}><p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[#f3e7ce]">{title}</p><p className="mt-1 text-sm leading-6 text-slate-300">{detail}</p></div>)}</div></section>

        <section className="border-b border-[#dcd8cc] bg-white"><div className="mx-auto grid max-w-[74rem] divide-y divide-[#dcd8cc] sm:grid-cols-4 sm:divide-x sm:divide-y-0">{goals.map((goal, index) => { const Icon = goal.icon; const featured = index === 0; return <Link className={featured ? "group bg-[#081d30] p-7 text-white" : "group p-7 transition-colors hover:bg-[#f1f5f2]"} href={goal.href} key={goal.title}><span className={featured ? "grid size-9 place-items-center rounded-lg bg-white/10 font-mono text-xs text-[#c6963f]" : "grid size-9 place-items-center rounded-lg bg-[#efede6] font-mono text-xs text-[#4a564f]"}>{goal.code}</span><Icon className={featured ? "mt-7 size-5 text-[#c6963f]" : "mt-7 size-5 text-[#0e6e5c]"} /><h2 className="mt-3 text-lg font-semibold">{goal.title}</h2><p className={featured ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-[#4a564f]"}>{goal.description}</p><span className={featured ? "mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#f3e7ce]" : "mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0e6e5c]"}>Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>})}</div></section>

        <section className="mx-auto max-w-[74rem] px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-col gap-4 border-b-2 border-[#081d30] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs font-bold tracking-[.08em] text-[#0e6e5c] uppercase">Live opportunities</p><h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-[-.04em] text-[#081d30] sm:text-5xl">Newly published healthcare opportunities.</h2></div><Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#081d30]" href="/jobs">Browse all roles <ArrowRight className="size-4" /></Link></div>
          {featuredJobs.length ? <div className="mt-8 overflow-hidden border border-[#dcd8cc] bg-white">{featuredJobs.map((job, index) => <JobRow job={job} index={index} key={job.slug} />)}</div> : <div className="mt-8 border border-dashed border-[#dcd8cc] bg-white p-8"><p className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#081d30]">New opportunities are coming online.</p><p className="mt-2 text-[#4a564f]">Published roles will appear here as employers join SM VIA.</p></div>}
        </section>

        <section className="border-y border-[#dcd8cc] bg-[#efede6]"><div className="mx-auto max-w-[74rem] px-5 py-20 sm:px-8 lg:py-28"><p className="font-mono text-xs font-bold tracking-[.08em] text-[#0e6e5c] uppercase">Your path</p><h2 className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-[-.04em] text-[#081d30] sm:text-5xl">A real sequence — from preparation to your next opportunity.</h2><div className="relative mt-14 grid gap-10 md:grid-cols-4"><div className="absolute left-0 right-0 top-5 hidden h-px bg-[#dcd8cc] md:block" />{pathSteps.map((step, index) => <div className="relative" key={step.code}><span className={index < 2 ? "grid size-11 place-items-center rounded-full bg-[#0e6e5c] font-mono text-xs text-white" : "grid size-11 place-items-center rounded-full border-2 border-[#dcd8cc] bg-[#f6f5f1] font-mono text-xs text-[#4a564f]"}>{index === 0 ? <Check className="size-5" /> : step.code}</span><h3 className="mt-6 font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[#081d30]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#4a564f]">{step.description}</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0e6e5c]" href={step.href}>Learn more <ArrowRight className="size-4" /></Link></div>)}</div></div></section>

        <section className="mx-auto grid max-w-[74rem] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-28"><div><p className="font-mono text-xs font-bold tracking-[.08em] text-[#0e6e5c] uppercase">Organization profiles</p><h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-[-.04em] text-[#081d30] sm:text-5xl">Understand the workplace before you apply.</h2><p className="mt-5 max-w-lg text-lg leading-8 text-[#4a564f]">Organization profiles bring together care settings, locations, benefits, and open roles in one clear place.</p><Button asChild className="mt-7 h-11 rounded-lg bg-[#081d30] px-5 hover:bg-[#0e6e5c]"><Link href="/companies">Explore organizations <ArrowRight /></Link></Button></div><div className="border border-[#dcd8cc] bg-white shadow-[0_18px_45px_-28px_rgba(11,42,69,.45)]"><div className="flex items-center justify-between bg-[#081d30] px-6 py-4 text-sm font-semibold tracking-[.06em] text-white uppercase"><span>Organization profile</span><ShieldCheck className="size-5 text-[#c6963f]" /></div><div className="p-6"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-lg bg-[#dceae5] font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[#0e6e5c]">{organizations[0]?.name.slice(0, 2).toUpperCase() ?? "SM"}</span><div><p className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#081d30]">{organizations[0]?.name ?? "Healthcare organization"}</p><p className="text-sm text-[#4a564f]">{organizations[0]?.type ?? "Healthcare employer"}</p></div></div><dl className="mt-7 divide-y divide-[#dcd8cc] border-y border-[#dcd8cc]"><div className="flex justify-between py-3 text-sm"><dt className="text-[#4a564f]">Open roles</dt><dd className="font-mono font-semibold text-[#081d30]">{organizations[0]?.jobs.length ?? 0} active</dd></div><div className="flex justify-between py-3 text-sm"><dt className="text-[#4a564f]">Location</dt><dd className="font-mono font-semibold text-[#081d30]">{organizations[0]?.location ?? "U.S."}</dd></div><div className="flex justify-between py-3 text-sm"><dt className="text-[#4a564f]">Profile</dt><dd className="font-mono font-semibold text-[#0e6e5c]">Published</dd></div></dl></div></div></section>

        <section className="border-t border-[#dcd8cc] bg-white"><div className="mx-auto max-w-[74rem] px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-col gap-4 border-b-2 border-[#081d30] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs font-bold tracking-[.08em] text-[#0e6e5c] uppercase">Career resources</p><h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-[-.04em] text-[#081d30] sm:text-5xl">Practical guidance for the road ahead.</h2></div><Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#081d30]" href="/resources">View all resources <ArrowRight className="size-4" /></Link></div><div className="mt-2 divide-y divide-[#dcd8cc]">{resourceGuides.map((resource, index) => <Link className="group grid gap-3 py-6 transition-colors hover:text-[#0e6e5c] sm:grid-cols-[4rem_1fr_7rem_auto] sm:items-center" href={`/resources/${resource.slug}`} key={resource.slug}><span className="font-mono text-sm text-[#4a564f]">{String(index + 1).padStart(2, "0")}</span><div><p className="text-xs font-bold tracking-[.08em] text-[#0e6e5c] uppercase">{resource.category}</p><h3 className="mt-1 text-lg font-semibold text-[#081d30] group-hover:text-[#0e6e5c]">{resource.title}</h3></div><span className="font-mono text-sm text-[#4a564f]">{resource.readTime}</span><ArrowRight className="size-5 text-[#0e6e5c] transition-transform group-hover:translate-x-1" /></Link>)}</div></div></section>
      </main>
      <SiteFooter />
    </div>
  )
}
