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
import { Input } from "@/components/ui/input"
import { usStates } from "@/lib/auth/validation"
import {
  employmentTypes,
  experienceLevels,
  healthcareProfessions,
  workplaceTypes,
} from "@/lib/employer/constants"
import { filterJobs, type JobFilters } from "@/lib/jobs/job-filters"
import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { featuredJobs } from "@/lib/marketing-data"

export const metadata: Metadata = {
  title: "Healthcare Jobs",
  description:
    "Search U.S. healthcare jobs by profession, specialty, location, experience, and compensation.",
}

type RawSearchParams = Promise<
  Record<string, string | string[] | undefined>
>

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: RawSearchParams
}) {
  const params = await searchParams
  const filters = getFilters(params)
  const liveJobs = await getPublishedJobs()
  const allJobs = [...liveJobs, ...featuredJobs]
  const jobs = filterJobs(allJobs, filters)
  const specialties = [...new Set(allJobs.map((job) => job.specialty))].sort(
    (a, b) => a.localeCompare(b, "en-US"),
  )
  const activeFilterCount = getActiveFilterCount(filters)
  const preservedSearchFilters = getPreservedSearchFilters(filters)

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
                  Search U.S. healthcare opportunities by profession,
                  specialty, location, work setting, experience, and pay.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BriefcaseBusiness className="size-4 text-primary" />
                {jobs.length} {jobs.length === 1 ? "role" : "roles"} found
              </div>
            </div>
            <div className="mt-8">
              <HeroSearch
                compact
                location={filters.location}
                preservedFilters={preservedSearchFilters}
                query={filters.query}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8 lg:py-14">
          <aside>
            <Card className="border-border/80 bg-card lg:sticky lg:top-24">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-primary" />
                    <h2 className="font-semibold">Filter results</h2>
                  </div>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount} active</Badge>
                  )}
                </div>
                <form action="/jobs" className="mt-5 grid gap-4" method="get">
                  {filters.query && (
                    <input name="query" type="hidden" value={filters.query} />
                  )}
                  {filters.location && (
                    <input
                      name="location"
                      type="hidden"
                      value={filters.location}
                    />
                  )}

                  <FilterSelect
                    defaultValue={filters.profession}
                    label="Profession"
                    name="profession"
                    options={healthcareProfessions}
                    placeholder="All professions"
                  />
                  <FilterSelect
                    defaultValue={filters.specialty}
                    label="Specialty"
                    name="specialty"
                    options={specialties}
                    placeholder="All specialties"
                  />
                  <FilterSelect
                    defaultValue={filters.state}
                    label="State"
                    name="state"
                    options={usStates.map(([code, name]) => ({
                      label: name,
                      value: code,
                    }))}
                    placeholder="All states"
                  />
                  <FilterSelect
                    defaultValue={filters.employmentType}
                    label="Employment type"
                    name="employmentType"
                    options={employmentTypes}
                    placeholder="All employment types"
                  />
                  <FilterSelect
                    defaultValue={filters.workplaceType}
                    label="Workplace type"
                    name="workplaceType"
                    options={workplaceTypes}
                    placeholder="All workplace types"
                  />
                  <FilterSelect
                    defaultValue={filters.experienceLevel}
                    label="Experience level"
                    name="experienceLevel"
                    options={experienceLevels}
                    placeholder="All experience levels"
                  />

                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">
                      Annual salary range
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        aria-label="Minimum annual salary"
                        className="h-10"
                        defaultValue={filters.salaryMin}
                        min={0}
                        name="salaryMin"
                        placeholder="Minimum"
                        step={1000}
                        type="number"
                      />
                      <Input
                        aria-label="Maximum annual salary"
                        className="h-10"
                        defaultValue={filters.salaryMax}
                        min={0}
                        name="salaryMax"
                        placeholder="Maximum"
                        step={1000}
                        type="number"
                      />
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Salary filters compare annual ranges. Hourly roles remain
                      visible only when no salary range is selected.
                    </p>
                  </fieldset>

                  <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                    <input
                      className="mt-0.5 size-4 rounded border-input accent-primary"
                      defaultChecked={filters.visaOnly}
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
                  {activeFilterCount > 0 && (
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
                      Clear one or more filters, broaden the location, or try a
                      different salary range.
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

type FilterOption = string | { label: string; value: string }

function FilterSelect({
  defaultValue,
  label,
  name,
  options,
  placeholder,
}: {
  defaultValue: string
  label: string
  name: string
  options: readonly FilterOption[]
  placeholder: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className={selectClassName}
        defaultValue={defaultValue}
        name={name}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value
          const optionLabel =
            typeof option === "string" ? option : option.label

          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </label>
  )
}

function getFilters(
  params: Record<string, string | string[] | undefined>,
): JobFilters {
  return {
    query: getString(params.query),
    location: getString(params.location),
    profession: getString(params.profession),
    specialty: getString(params.specialty),
    state: getString(params.state).toUpperCase(),
    employmentType: getString(params.employmentType),
    workplaceType: getString(params.workplaceType),
    experienceLevel: getString(params.experienceLevel),
    salaryMin: getNonnegativeNumber(params.salaryMin),
    salaryMax: getNonnegativeNumber(params.salaryMax),
    visaOnly: getString(params.visa) === "true",
  }
}

function getString(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function getNonnegativeNumber(value: string | string[] | undefined) {
  const rawValue = getString(value)
  if (!rawValue) {
    return undefined
  }

  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function getActiveFilterCount(filters: JobFilters) {
  return [
    filters.query,
    filters.location,
    filters.profession,
    filters.specialty,
    filters.state,
    filters.employmentType,
    filters.workplaceType,
    filters.experienceLevel,
    filters.salaryMin,
    filters.salaryMax,
    filters.visaOnly,
  ].filter(Boolean).length
}

function getPreservedSearchFilters(filters: JobFilters) {
  return Object.fromEntries(
    [
      ["profession", filters.profession],
      ["specialty", filters.specialty],
      ["state", filters.state],
      ["employmentType", filters.employmentType],
      ["workplaceType", filters.workplaceType],
      ["experienceLevel", filters.experienceLevel],
      ["salaryMin", filters.salaryMin?.toString() ?? ""],
      ["salaryMax", filters.salaryMax?.toString() ?? ""],
      ["visa", filters.visaOnly ? "true" : ""],
    ].filter((entry) => entry[1]),
  )
}
