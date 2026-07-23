import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, Filter, SearchX } from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSearch } from "@/components/marketing/hero-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { featuredJobs } from "@/lib/marketing-data"

export const metadata: Metadata = {
  title: "Healthcare Jobs",
  description:
    "Search live and preview healthcare jobs by specialty, employer, and location.",
}

type JobsSearchParams = Promise<{
  query?: string
  location?: string
  specialty?: string
  type?: string
  visa?: string
}>

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: JobsSearchParams
}) {
  const params = await searchParams
  const query = params.query?.trim() ?? ""
  const location = params.location?.trim() ?? ""
  const specialty = params.specialty?.trim() ?? ""
  const type = params.type?.trim() ?? ""
  const visaOnly = params.visa === "true"

  const normalizedQuery = normalize(query)
  const normalizedLocation = normalize(location)
  const liveJobs = await getPublishedJobs()
  const allJobs = [...liveJobs, ...featuredJobs]

  const jobs = allJobs.filter((job) => {
    const matchesQuery =
      !normalizedQuery ||
      [job.title, job.employer, job.specialty, job.setting].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    const matchesLocation =
      !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation)
    const matchesSpecialty = !specialty || job.specialty === specialty
    const matchesType = !type || job.type === type
    const matchesVisa = !visaOnly || job.visaSupport

    return (
      matchesQuery &&
      matchesLocation &&
      matchesSpecialty &&
      matchesType &&
      matchesVisa
    )
  })

  const specialties = [...new Set(allJobs.map((job) => job.specialty))].sort()
  const employmentTypes = [...new Set(allJobs.map((job) => job.type))].sort()
  const hasFilters = Boolean(query || location || specialty || type || visaOnly)

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f8fcff_0%,#eef8f8_48%,#f6fbff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge
                  className={
                    liveJobs.length
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : undefined
                  }
                  variant="outline"
                >
                  {liveJobs.length ? "Live marketplace beta" : "Product preview"}
                </Badge>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  Healthcare jobs
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Search employer-published healthcare opportunities alongside
                  clearly labeled sample listings.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BriefcaseBusiness className="size-4 text-primary" />
                {jobs.length} {jobs.length === 1 ? "role" : "roles"} found
              </div>
            </div>
            <div className="mt-8">
              <HeroSearch compact location={location} query={query} />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8 lg:py-14">
          <aside>
            <Card className="sticky top-24 border-border/80 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-primary" />
                  <h2 className="font-semibold">Filter results</h2>
                </div>
                <form action="/jobs" className="mt-5 grid gap-5" method="get">
                  {query && <input name="query" type="hidden" value={query} />}
                  {location && (
                    <input name="location" type="hidden" value={location} />
                  )}

                  <label className="grid gap-2 text-sm font-medium">
                    Specialty
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                      defaultValue={specialty}
                      name="specialty"
                    >
                      <option value="">All specialties</option>
                      {specialties.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Employment type
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                      defaultValue={type}
                      name="type"
                    >
                      <option value="">All types</option>
                      {employmentTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                    <input
                      className="mt-0.5 size-4 rounded border-input accent-primary"
                      defaultChecked={visaOnly}
                      name="visa"
                      type="checkbox"
                      value="true"
                    />
                    <span>
                      <span className="block font-medium">Visa support</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        Show roles marked for potential sponsorship support.
                      </span>
                    </span>
                  </label>

                  <Button className="h-10 rounded-xl" type="submit">
                    Apply filters
                  </Button>
                  {hasFilters && (
                    <Button asChild className="h-10 rounded-xl" variant="ghost">
                      <Link href="/jobs">Clear all filters</Link>
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </aside>

          <div>
            {jobs.length > 0 ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard job={job} key={job.slug} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="grid min-h-80 place-items-center p-8 text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-primary">
                      <SearchX className="size-5" />
                    </span>
                    <h2 className="mt-5 text-xl font-semibold">
                      No roles match these filters
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Try a broader specialty, employer, or location.
                    </p>
                    <Button asChild className="mt-6 rounded-xl">
                      <Link href="/jobs">View all roles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
