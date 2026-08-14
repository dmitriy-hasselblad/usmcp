import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpenText, Building2, GraduationCap, HeartPulse, Landmark, MapPin, ShieldCheck, Stethoscope } from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { OrganizationTrustBadge } from "@/components/organizations/organization-trust-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { formatNewsDate, getPublishedOrganizationPosts } from "@/lib/news/public-news"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import heroHealthcareTeam from "../../public/images/ushce-hero-healthcare-team.png"

const popularSearches = ["Registered Nurse", "Physician", "Medical Assistant", "Radiology", "Physical Therapist"]

const audiencePaths = [
  { title: "Healthcare professionals", description: "Find focused roles, manage applications, and build a career profile designed for healthcare.", href: "/jobs", action: "Explore jobs", icon: Stethoscope },
  { title: "Employers", description: "Publish opportunities, review qualified applicants, and manage a secure hiring workflow.", href: "/for-employers", action: "For employers", icon: Building2 },
  { title: "Students & trainees", description: "Explore residency planning, career guidance, and the next steps in your healthcare journey.", href: "/resources", action: "Explore resources", icon: GraduationCap },
  { title: "International candidates", description: "Find U.S. healthcare opportunities and practical information for international career planning.", href: "/jobs?visa=true", action: "View visa-support roles", icon: Landmark },
]

export default async function Home() {
  const [liveJobs, publicOrganizations, news] = await Promise.all([
    getPublishedJobs(),
    getPublicOrganizations(),
    getPublishedOrganizationPosts(undefined, undefined, 1),
  ])
  const featuredJobs = liveJobs.slice(0, 3)
  const featuredPosts = news.posts.slice(0, 3)

  return (
    <div className="min-h-dvh overflow-hidden bg-white text-foreground">
      <SiteHeader />
      <main id="top">
        <section className="border-b border-slate-200 bg-[linear-gradient(125deg,#f8fbff_0%,#eef7ff_52%,#f8fcfc_100%)]">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.96fr)_minmax(30rem,0.84fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-primary"><HeartPulse className="size-4" />U.S. healthcare careers, in one place</div>
              <h1 className="mt-7 text-5xl font-semibold tracking-[-0.07em] text-slate-950 sm:text-6xl lg:text-7xl">Build your healthcare career in the U.S.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">Discover healthcare opportunities, connect with organizations, and take your next professional step with confidence.</p>
              <div className="mt-9 max-w-3xl"><HeroSearch /></div>
              <div className="mt-6 flex flex-wrap items-center gap-2.5 text-sm"><span className="mr-1 font-medium text-slate-600">Popular:</span>{popularSearches.map((search) => <Link className="rounded-full border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 transition-colors hover:border-primary/30 hover:text-primary" href={`/jobs?query=${encodeURIComponent(search)}`} key={search}>{search}</Link>)}</div>
            </div>
            <div className="relative mx-auto w-full max-w-2xl lg:justify-self-end">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blue-200/40 blur-3xl" />
              <div className="relative aspect-[1.16/1] overflow-hidden rounded-[2rem] border border-white/80 bg-slate-200 shadow-[0_32px_70px_rgba(15,76,129,0.18)] sm:aspect-[1.24/1]"><Image alt="A diverse team of healthcare professionals in a modern clinical setting" className="object-cover object-[65%_center]" fill placeholder="blur" priority sizes="(max-width: 1024px) 100vw, 48vw" src={heroHealthcareTeam} /></div>
              <div className="absolute -bottom-6 left-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:left-8"><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Explore opportunities</p><p className="mt-1 text-sm font-semibold text-slate-900">Live roles from healthcare organizations</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold tracking-[0.12em] text-primary uppercase">Featured opportunities</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Explore roles from healthcare organizations.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Browse live, employer-published opportunities currently available on USHCE.</p></div><Button asChild className="h-10 w-fit rounded-xl" variant="outline"><Link href="/jobs">View all jobs <ArrowRight /></Link></Button></div>
          {featuredJobs.length ? <div className="mt-10 grid gap-5 lg:grid-cols-3">{featuredJobs.map((job) => <JobCard job={job} key={job.slug} />)}</div> : <Card className="mt-10 border-dashed bg-slate-50"><CardContent className="p-8 sm:p-10"><h3 className="text-xl font-semibold">New roles are coming online.</h3><p className="mt-2 max-w-xl leading-7 text-muted-foreground">Employers will appear here as they publish approved healthcare opportunities.</p><Button asChild className="mt-5" variant="outline"><Link href="/jobs">Browse all opportunities</Link></Button></CardContent></Card>}
        </section>

        <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto max-w-[90rem] px-5 py-20 lg:px-8 lg:py-28"><p className="text-sm font-bold tracking-[0.12em] text-primary uppercase">One ecosystem, every path</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">A clear experience for every healthcare journey.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Whether you are seeking a role, building a team, or planning your next step, USHCE gives you a focused starting point.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{audiencePaths.map((path) => { const Icon = path.icon; return <Link className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={path.href} key={path.title}><Card className="h-full border-slate-200 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_18px_38px_rgba(15,76,129,0.11)]"><CardContent className="flex h-full flex-col p-6"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-primary"><Icon className="size-6" /></span><h3 className="mt-7 text-xl font-semibold tracking-[-0.035em]">{path.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary">{path.action}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></CardContent></Card></Link> })}</div></div></section>

        <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-center"><div><p className="text-sm font-bold tracking-[0.12em] text-primary uppercase">Organizations</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Learn about the workplace before you apply.</h2><p className="mt-4 leading-7 text-muted-foreground">Organization profiles bring together care setting, location, public information, verification status, and open positions.</p><Button asChild className="mt-7 h-11 rounded-xl px-5"><Link href="/companies">Explore organizations <ArrowRight /></Link></Button></div><div className="grid gap-3 sm:grid-cols-2">{publicOrganizations.slice(0, 4).map((organization) => <Link className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/companies/${organization.slug}`} key={organization.id}><Card className="h-full border-slate-200 bg-slate-50 transition-all group-hover:border-primary/30 group-hover:bg-white group-hover:shadow-lg"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-primary shadow-sm"><Building2 className="size-5" /></span><OrganizationTrustBadge showNeutral={false} verificationStatus={organization.verificationStatus} /></div><h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{organization.name}</h3><p className="mt-1 text-sm text-muted-foreground">{organization.type}</p><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 text-primary" />{organization.location}</p></CardContent></Card></Link>)}{!publicOrganizations.length && <Card className="border-dashed bg-slate-50 sm:col-span-2"><CardContent className="p-7"><ShieldCheck className="size-7 text-primary" /><h3 className="mt-4 text-xl font-semibold">Organization profiles are growing.</h3><p className="mt-2 leading-7 text-muted-foreground">Profiles will appear as healthcare organizations publish approved opportunities.</p></CardContent></Card>}</div></div></section>

        <section className="bg-[#10253f] text-white"><div className="mx-auto max-w-[90rem] px-5 py-20 lg:px-8 lg:py-28"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold tracking-[0.12em] text-blue-200 uppercase">News & insights</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Stories from the healthcare community.</h2></div><Button asChild className="h-10 w-fit border-white/20 bg-transparent text-white hover:bg-white/10" variant="outline"><Link href="/news">Read all insights <ArrowRight /></Link></Button></div>{featuredPosts.length ? <div className="mt-10 grid gap-5 lg:grid-cols-3">{featuredPosts.map((post) => <Link className="group" href={`/news/${post.slug}`} key={post.id}><Card className="h-full overflow-hidden border-white/10 bg-white/[0.07] text-white transition-all group-hover:-translate-y-1 group-hover:bg-white/[0.11]">{post.cover_image_path && <div className="relative aspect-[16/9] overflow-hidden"><Image alt="" className="object-cover transition-transform duration-500 group-hover:scale-105" fill sizes="(max-width: 1024px) 100vw, 33vw" src={`/news/image/${post.id}`} /></div>}<CardContent className="p-6"><p className="text-xs font-bold tracking-[0.11em] text-blue-200 uppercase">{post.organizations?.[0]?.name ?? "Healthcare insight"}</p><h3 className="mt-4 text-xl font-semibold leading-7 tracking-[-0.035em]">{post.title}</h3><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{post.excerpt}</p><p className="mt-6 text-sm text-slate-300">{formatNewsDate(post.published_at)}</p></CardContent></Card></Link>)}</div> : <Card className="mt-10 border-white/10 bg-white/[0.07] text-white"><CardContent className="p-8"><BookOpenText className="size-7 text-blue-200" /><h3 className="mt-4 text-xl font-semibold">Insights are on the way.</h3><p className="mt-2 max-w-xl leading-7 text-slate-300">Healthcare organizations can publish approved updates and practical insights here.</p></CardContent></Card>}</div></section>

        <section className="mx-auto max-w-[90rem] px-5 py-16 lg:px-8 lg:py-20"><div className="rounded-[2rem] bg-[linear-gradient(120deg,#1462a2_0%,#287ed8_100%)] px-6 py-12 text-center text-white shadow-[0_24px_55px_rgba(24,104,184,0.24)] sm:px-12 sm:py-16"><h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">Your next chapter in healthcare starts here.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-50/90 sm:text-lg">Search live opportunities or create a professional account to build your private profile and apply securely.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild className="h-12 rounded-xl bg-white px-6 font-semibold text-primary hover:bg-blue-50"><Link href="/jobs">Find jobs <ArrowRight /></Link></Button><Button asChild className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-white hover:bg-white/15" variant="outline"><Link href="/sign-up">Create your profile</Link></Button></div></div></section>
      </main>
      <SiteFooter />
    </div>
  )
}
