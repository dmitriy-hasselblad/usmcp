import Link from "next/link"
import { ArrowRight, Check, MapPin, ShieldCheck } from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { OrganizationCard } from "@/components/organizations/organization-card"
import { Button } from "@/components/ui/button"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import { popularSpecialties } from "@/lib/marketing-data"

export default async function Home() {
  const [liveJobs, publicOrganizations] = await Promise.all([
    getPublishedJobs(),
    getPublicOrganizations(),
  ])
  const featuredJobs = liveJobs.slice(0, 3)
  const liveEmployerCount = new Set(
    liveJobs
      .filter((job) => !job.isPlatformDemo)
      .map((job) => job.employerSlug || job.employer),
  ).size

  return (
    <div className="min-h-dvh bg-white text-slate-950">
      <SiteHeader />
      <main id="top">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
            <p className="text-sm font-semibold text-primary">
              U.S. healthcare careers, made clearer
            </p>
            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.07em] text-slate-950 sm:text-6xl lg:text-8xl lg:leading-[0.96]">
              Where healthcare talent meets thoughtful hiring.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 sm:text-2xl sm:leading-9">
              Search healthcare roles by specialty and location, understand
              employers before you apply, and manage your next career move in
              one place.
            </p>

            <div className="mt-10 max-w-5xl">
              <HeroSearch />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-950">Explore:</span>
              {popularSpecialties.slice(0, 5).map((specialty) => (
                <Link
                  className="transition-colors hover:text-primary hover:underline"
                  href={`/jobs?query=${encodeURIComponent(specialty)}`}
                  key={specialty}
                >
                  {specialty}
                </Link>
              ))}
            </div>

            <div className="mt-14 grid border-t border-slate-200 pt-8 sm:grid-cols-3 sm:gap-8">
              <div className="border-b border-slate-200 py-6 sm:border-b-0 sm:border-r sm:py-0 sm:pr-8">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                  {liveJobs.length || "New"}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  live role{liveJobs.length === 1 ? "" : "s"} currently listed
                </p>
              </div>
              <div className="border-b border-slate-200 py-6 sm:border-b-0 sm:border-r sm:px-8 sm:py-0">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                  50 states
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  location-aware search across the United States
                </p>
              </div>
              <div className="py-6 sm:py-0 sm:pl-8">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                  Private by default
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  you control when employers can discover your profile
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Recently published</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-4xl">
                  Opportunities worth exploring.
                </h2>
              </div>
              <Button asChild className="h-11 w-fit rounded-lg px-4" variant="outline">
                <Link href="/jobs">
                  Browse all roles <ArrowRight />
                </Link>
              </Button>
            </div>

            {featuredJobs.length ? (
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {featuredJobs.map((job) => (
                  <JobCard job={job} key={job.slug} />
                ))}
              </div>
            ) : (
              <div className="mt-10 border border-dashed border-slate-300 bg-white p-8 text-center">
                <h3 className="text-xl font-semibold">New opportunities are coming soon.</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Employers can publish roles through their USHCE workspace.
                  Check back as new opportunities are added.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold text-primary">For healthcare employers</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-4xl">
                Build a more informed hiring process.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Create an organization workspace, publish roles, communicate
                securely with candidates, and coordinate interviews.
              </p>
              <Button asChild className="mt-7 h-11 rounded-lg px-5">
                <Link href="/for-employers">
                  Explore employer tools <ArrowRight />
                </Link>
              </Button>
              <p className="mt-6 flex gap-2 text-sm leading-6 text-slate-600">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                Public verification is displayed only after an organization has
                completed the platform review.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {publicOrganizations.slice(0, 4).map((organization) => (
                <OrganizationCard compact key={organization.id} organization={organization} />
              ))}
              {publicOrganizations.length === 0 && (
                <div className="border border-slate-200 bg-slate-50 p-7 sm:col-span-2">
                  <p className="font-semibold">Organization profiles are coming online.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Organizations appear here after publishing an active role.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold text-blue-300">Start your next step</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">
                Make your healthcare experience easier to navigate.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Search roles as a guest, or create a private account to manage
                your profile, applications, documents, and conversations.
              </p>
              {liveEmployerCount > 0 && (
                <p className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                  <Check className="size-4 text-blue-300" />
                  Roles are currently published by {liveEmployerCount} non-demo
                  employer{liveEmployerCount === 1 ? "" : "s"}.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-lg bg-white px-5 text-slate-950 hover:bg-slate-100">
                <Link href="/jobs">Search jobs <ArrowRight /></Link>
              </Button>
              <Button asChild className="h-12 rounded-lg border-white/30 bg-transparent px-5 text-white hover:bg-white/10" variant="outline">
                <Link href="/sign-up">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
