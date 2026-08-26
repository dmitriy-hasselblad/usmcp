import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Building2,
  DollarSign,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPin,
  Stethoscope,
} from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { Button } from "@/components/ui/button"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import type { Job } from "@/lib/marketing-data"
import { formatNewsDate, getPublishedOrganizationPosts } from "@/lib/news/public-news"
import healthcareTeamImage from "../../public/images/ushce-healthcare-team.png"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

const popularSearches = [
  "Registered Nurse",
  "Physician",
  "Medical Assistant",
  "Radiologic Technologist",
  "Physical Therapist",
]

const audiencePaths = [
  {
    title: "Healthcare professionals",
    description: "Find your next role, track applications, and grow your career with a profile built for healthcare.",
    href: "/jobs",
    action: "Find jobs",
    icon: Stethoscope,
  },
  {
    title: "Employers",
    description: "Post jobs, discover qualified talent, and manage your hiring workflow in one place.",
    href: "/for-employers",
    action: "For employers",
    icon: Building2,
  },
  {
    title: "Students",
    description: "Explore careers, residency planning, and practical guidance for your professional journey.",
    href: "/resources",
    action: "Explore resources",
    icon: GraduationCap,
  },
  {
    title: "International candidates",
    description: "Navigate U.S. opportunities, credentialing, licensing, and visa-support pathways.",
    href: "/jobs?visa=true",
    action: "View pathways",
    icon: Landmark,
  },
]

function displayPosted(job: Job) {
  if (!job.publishedAt) return job.posted
  const days = Math.max(0, Math.floor((Date.now() - new Date(job.publishedAt).getTime()) / 86_400_000))
  if (days === 0) return "Posted today"
  if (days === 1) return "Posted 1 day ago"
  if (days < 31) return `Posted ${days} days ago`
  return job.posted
}

function PremiumJobCard({ job }: { job: Job }) {
  const jobBenefits = job.benefits.slice(0, 2)

  return (
    <article className="flex min-h-[27rem] flex-col rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,35,62,0.045)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_42px_rgba(15,76,129,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-[4.25rem] place-items-center rounded-2xl bg-blue-50 text-primary">
          <Building2 className="size-7" />
        </div>
        {job.source === "live" && !job.isPlatformDemo && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <BadgeCheck className="size-4" />
            Live
          </span>
        )}
      </div>
      <h2 className="mt-6 text-[1.55rem] font-semibold leading-[1.12] tracking-[-0.045em] text-slate-950">
        <Link className="transition-colors hover:text-primary" href={`/jobs/${job.slug}`}>
          {job.title}
        </Link>
      </h2>
      <p className="mt-2 text-lg text-slate-500">{job.employer}</p>
      <div className="mt-6 space-y-3 text-base text-slate-600">
        <span className="flex items-center gap-2"><MapPin className="size-5 text-primary" />{job.location}</span>
        <span className="flex items-center gap-2"><DollarSign className="size-5 text-primary" />{job.salary}</span>
        <span className="flex items-center gap-2"><HeartPulse className="size-5 text-primary" />{job.type}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {job.visaSupport && <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">Visa support</span>}
        {jobBenefits.map((benefit) => <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600" key={benefit}>{benefit}</span>)}
      </div>
      <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm text-slate-500">
        <span>{displayPosted(job)}</span>
        <Button asChild className="h-11 rounded-xl bg-[#2376d8] px-5 text-base hover:bg-[#1c65ba]"><Link href={`/jobs/${job.slug}`}>View job</Link></Button>
      </div>
    </article>
  )
}

export default async function Home() {
  const [liveJobs, news] = await Promise.all([
    getPublishedJobs(),
    getPublishedOrganizationPosts(undefined, undefined, 3),
  ])
  const featuredJobs = liveJobs.slice(0, 3)
  const featuredPosts = news.posts.slice(0, 3)

  return (
    <div className="min-h-dvh overflow-hidden bg-white text-slate-950">
      <SiteHeader />
      <main id="top">
        <section className="border-b border-slate-200 bg-[linear-gradient(115deg,#f9fcff_0%,#eef8ff_45%,#f7fcff_100%)]">
          <div className="mx-auto grid max-w-[96rem] gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1.04fr)_minmax(32rem,0.86fr)] lg:items-center lg:px-10 lg:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#2376d8]"><Building2 className="size-4" />Explore live healthcare opportunities</div>
              <h1 className="mt-9 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.075em] text-[#10203a] sm:text-6xl lg:text-[5.35rem]">Where U.S. healthcare talent meets verified employers.</h1>
              <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-600 sm:text-2xl">Search real roles by specialty and state, review employer profiles before you apply, and manage the entire hiring process in one place.</p>
              <div className="mt-10 max-w-4xl"><HeroSearch /></div>
              <div className="mt-8 flex flex-wrap items-center gap-2.5 text-base"><span className="mr-1 text-slate-600">Popular:</span>{popularSearches.map((search) => <Link className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 transition-colors hover:border-blue-300 hover:text-primary" href={`/jobs?query=${encodeURIComponent(search)}`} key={search}>{search}</Link>)}</div>
            </div>
            <div className="relative mx-auto w-full max-w-[40rem] lg:justify-self-end">
              <div className="absolute -inset-8 -z-10 rounded-[4rem] bg-blue-200/35 blur-3xl" />
              <div className="relative aspect-[0.98] overflow-hidden rounded-[2.3rem] shadow-[0_32px_70px_rgba(15,76,129,0.20)] lg:aspect-[0.88]">
                <Image alt="A diverse team of healthcare professionals in a modern clinical setting" className="object-cover object-[63%_center]" fill placeholder="blur" priority sizes="(max-width: 1024px) 100vw, 43vw" src={healthcareTeamImage} />
              </div>
              <div className="absolute -bottom-8 -left-4 rounded-[1.5rem] border border-slate-200 bg-white px-7 py-6 shadow-xl sm:left-0"><p className="text-sm text-slate-500">Live opportunities</p><p className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#10203a]">{liveJobs.length || "New"}</p><p className="mt-1 text-sm font-medium text-[#2376d8]">Healthcare roles available</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[96rem] px-6 py-24 lg:px-10 lg:py-32">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#10203a] sm:text-5xl">Featured opportunities</h2><p className="mt-4 text-xl text-slate-600">Live roles from healthcare organizations on SM VIA.</p></div><Link className="inline-flex items-center gap-3 text-lg font-medium text-slate-950 hover:text-primary" href="/jobs">View all jobs <ArrowRight className="size-5" /></Link></div>
          {featuredJobs.length ? <div className="mt-12 grid gap-6 xl:grid-cols-3">{featuredJobs.map((job) => <PremiumJobCard job={job} key={job.slug} />)}</div> : <div className="mt-12 rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50 p-10"><h2 className="text-2xl font-semibold">New opportunities are coming online.</h2><p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Employer-published roles will appear here as the SM VIA marketplace grows.</p><Button asChild className="mt-6 rounded-xl"><Link href="/jobs">Browse all opportunities</Link></Button></div>}
        </section>

        <section className="border-y border-slate-200 bg-[#f5f9fd]"><div className="mx-auto max-w-[96rem] px-6 py-24 lg:px-10 lg:py-28"><h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#10203a] sm:text-5xl">One ecosystem, every path</h2><p className="mt-4 max-w-3xl text-xl leading-8 text-slate-600">Whether you care for patients, hire them, or are just starting out, SM VIA has a tailored experience.</p><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{audiencePaths.map((path) => { const Icon = path.icon; return <Link className="group rounded-[1.7rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={path.href} key={path.title}><article className="flex min-h-[22rem] h-full flex-col rounded-[1.7rem] border border-slate-200 bg-white p-7 transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-[0_18px_40px_rgba(15,76,129,0.10)]"><span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#2376d8]"><Icon className="size-7" /></span><h2 className="mt-8 text-2xl font-semibold tracking-[-0.045em] text-[#10203a]">{path.title}</h2><p className="mt-5 text-lg leading-8 text-slate-600">{path.description}</p><span className="mt-auto inline-flex items-center gap-2 pt-8 text-lg font-medium text-[#2376d8]">{path.action}<ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></span></article></Link> })}</div></div></section>

        <section className="bg-[#10223c] text-white"><div className="mx-auto max-w-[96rem] px-6 py-24 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold tracking-[0.14em] text-blue-200 uppercase">SM VIA insights</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Stories shaping healthcare</h2></div><Link className="inline-flex w-fit items-center gap-3 rounded-xl border border-white/30 px-5 py-3 text-lg font-medium transition hover:bg-white/10" href="/news">Read the insights <ArrowRight className="size-5" /></Link></div>{featuredPosts.length ? <div className="mt-12 grid gap-6 lg:grid-cols-3">{featuredPosts.map((post) => <Link className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.07] transition hover:-translate-y-1 hover:bg-white/[0.11]" href={`/news/${post.slug}`} key={post.id}><article className="h-full"><div className="relative aspect-[1.55] overflow-hidden bg-slate-700">{post.cover_image_path ? <Image alt="" className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(max-width: 1024px) 100vw, 33vw" src={`/news/image/${post.id}`} /> : <BookOpenText className="absolute left-8 top-8 size-10 text-blue-200" />}</div><div className="p-7"><p className="text-sm font-semibold tracking-[0.12em] text-blue-200 uppercase">{post.organizations?.[0]?.name ?? "Healthcare insight"}</p><h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em]">{post.title}</h2><p className="mt-5 line-clamp-3 text-lg leading-8 text-slate-300">{post.excerpt}</p><p className="mt-7 text-lg text-slate-300">{formatNewsDate(post.published_at)}</p></div></article></Link>)}</div> : <div className="mt-12 rounded-[1.7rem] border border-white/15 bg-white/[0.06] p-9"><BookOpenText className="size-8 text-blue-200" /><h2 className="mt-5 text-2xl font-semibold">More practical healthcare insights are coming soon.</h2><p className="mt-3 max-w-xl text-lg leading-8 text-slate-300">Published news and insights from the SM VIA community will appear here.</p></div>}</div></section>

        <section className="mx-auto max-w-[96rem] px-6 py-20 lg:px-10 lg:py-28"><div className="rounded-[2rem] bg-[linear-gradient(115deg,#1671dc,#4c96e8)] px-7 py-16 text-center text-white shadow-[0_28px_55px_rgba(25,112,214,0.24)] sm:px-14 sm:py-20"><h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-6xl">Your next chapter in healthcare starts here</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-50 sm:text-xl">Find a role that fits your path, or create your professional account to apply securely.</p><div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"><Button asChild className="h-12 rounded-xl bg-white px-7 text-lg text-[#155da9] hover:bg-blue-50"><Link href="/jobs">Find jobs</Link></Button><Button asChild className="h-12 rounded-xl border-white/35 bg-white/10 px-7 text-lg text-white hover:bg-white/15" variant="outline"><Link href="/sign-up">Create your profile</Link></Button></div></div></section>
      </main>
      <SiteFooter />
    </div>
  )
}
