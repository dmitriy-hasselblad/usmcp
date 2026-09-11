import "server-only"

import { usStates } from "@/lib/auth/validation"
import type { Job } from "@/lib/marketing-data"

const USAJOBS_SEARCH_URL = "https://data.usajobs.gov/api/Search"
const USAJOBS_SOURCE_NAME = "USAJOBS"
const HEALTHCARE_OCCUPATIONAL_SERIES = [
  { code: "0602", profession: "Physician", specialty: "Federal healthcare" }, // Medical Officer
  { code: "0610", profession: "Registered Nurse", specialty: "Federal healthcare" }, // Nurse
  { code: "0630", profession: "Other Healthcare Professional", specialty: "Nutrition and dietetics" }, // Dietitian and Nutritionist
  { code: "0631", profession: "Occupational Therapist", specialty: "Federal healthcare" },
  { code: "0633", profession: "Physical Therapist", specialty: "Federal healthcare" },
  { code: "0644", profession: "Clinical Laboratory Scientist", specialty: "Federal healthcare" }, // Clinical Laboratory Science
  { code: "0649", profession: "Radiologic Technologist", specialty: "Federal healthcare" }, // Medical Instrument Technician
  { code: "0660", profession: "Pharmacist", specialty: "Federal healthcare" },
] as const

type HealthcareOccupationalSeries = (typeof HEALTHCARE_OCCUPATIONAL_SERIES)[number]

type UsaJobsSearchResponse = {
  SearchResult?: {
    SearchResultItems?: UsaJobsSearchItem[]
  }
}

type UsaJobsSearchItem = {
  MatchedObjectId?: string
  MatchedObjectDescriptor?: UsaJobsDescriptor
}

type UsaJobsSearchResult = {
  item: UsaJobsSearchItem
  series: HealthcareOccupationalSeries
}

type UsaJobsDescriptor = {
  ApplyURI?: string[]
  MatchedObjectId?: string
  OrganizationName?: string
  PositionEndDate?: string
  PositionID?: string
  PositionLocation?: Array<{
    CityName?: string
    CountrySubDivisionCode?: string
  }>
  PositionLocationDisplay?: string
  PositionRemuneration?: Array<{
    MaximumRange?: string
    MinimumRange?: string
    RateIntervalCode?: string
  }>
  PositionSchedule?: Array<{
    Name?: string
  }>
  PositionStartDate?: string
  PositionTitle?: string
  PositionURI?: string
  PublicationStartDate?: string
  UserArea?: {
    Details?: {
      JobCategory?: Array<{
        Name?: string
      }>
    }
  }
}

export type UsaJobsOpportunity = Job & {
  source: "usajobs"
  externalUrl: string
  sourceName: typeof USAJOBS_SOURCE_NAME
}

/**
 * Current federal healthcare opportunities from the official USAJOBS Search
 * API. We retain USAJOBS values for public display and send people back to the
 * official announcement to view details and apply.
 */
export async function getUsaJobsHealthcareOpportunities(): Promise<
  UsaJobsOpportunity[]
> {
  const apiKey = process.env.USAJOBS_API_KEY
  const apiEmail = process.env.USAJOBS_API_EMAIL

  if (!apiKey || !apiEmail) {
    return []
  }

  try {
    const responses = await Promise.all(
      HEALTHCARE_OCCUPATIONAL_SERIES.map(async (series) => {
        const query = new URLSearchParams({
          Fields: "Full",
          JobCategoryCode: series.code,
          ResultsPerPage: "20",
          SortDirection: "Desc",
          SortField: "openingdate",
          WhoMayApply: "Public",
        })
        const response = await fetch(`${USAJOBS_SEARCH_URL}?${query.toString()}`, {
          headers: {
            "Authorization-Key": apiKey,
            Host: "data.usajobs.gov",
            "User-Agent": apiEmail,
          },
          next: { revalidate: 3600 },
        })

        if (!response.ok) {
          console.error("USAJOBS healthcare search failed", {
            series: series.code,
            status: response.status,
          })
          return []
        }

        const payload = (await response.json()) as UsaJobsSearchResponse
        return (payload.SearchResult?.SearchResultItems ?? []).map((item) => ({
          item,
          series,
        }))
      }),
    )
    const seen = new Set<string>()

    const items = interleaveSeriesResults(responses)
    const opportunities = items
      .map(toUsaJobsOpportunity)
      .filter((job): job is UsaJobsOpportunity => Boolean(job))
      .filter((job) => {
        if (seen.has(job.slug)) return false
        seen.add(job.slug)
        return true
      })

    return opportunities
  } catch (error) {
    console.error("USAJOBS healthcare search request failed", error)
    return []
  }
}

function toUsaJobsOpportunity(
  result: UsaJobsSearchResult,
): UsaJobsOpportunity | undefined {
  const { item, series } = result
  const descriptor = item.MatchedObjectDescriptor
  if (!descriptor) return undefined

  const identifier = item.MatchedObjectId ?? descriptor.MatchedObjectId ?? descriptor.PositionID
  const title = descriptor.PositionTitle?.trim()
  const employer = descriptor.OrganizationName?.trim()
  const externalUrl = descriptor.PositionURI?.trim()
  const location = descriptor?.PositionLocation?.[0]
  const stateCode = stateCodeFromUsaJobs(location?.CountrySubDivisionCode)
  const city = location?.CityName?.trim()

  if (!identifier || !title || !employer || !externalUrl || !city || !stateCode) {
    return undefined
  }

  const remuneration = descriptor.PositionRemuneration?.[0]
  const salaryMin = parseSalary(remuneration?.MinimumRange)
  const salaryMax = parseSalary(remuneration?.MaximumRange)
  const salaryPeriod = salaryPeriodFromUsaJobs(remuneration?.RateIntervalCode)
  const publishedAt = descriptor.PublicationStartDate ?? descriptor.PositionStartDate
  const expiresAt = descriptor.PositionEndDate
  const category = descriptor.UserArea?.Details?.JobCategory?.[0]?.Name?.trim()

  return {
    slug: `usajobs-${identifier}`,
    title,
    employer,
    employerSlug: "",
    location: descriptor.PositionLocationDisplay?.trim() || `${city}, ${stateCode}`,
    salary: formatSalary(salaryMin, salaryMax, salaryPeriod),
    type: descriptor.PositionSchedule?.[0]?.Name?.trim() || "Schedule not listed",
    specialty: category || series.specialty,
    setting: "Federal opportunity",
    posted: formatPostedDate(publishedAt),
    summary:
      "Federal job announcement. View the official USAJOBS listing for complete details and to apply.",
    responsibilities: [],
    qualifications: [],
    benefits: [],
    source: "usajobs",
    sourceName: USAJOBS_SOURCE_NAME,
    externalUrl,
    profession: series.profession,
    experienceLevel: "Not listed",
    city,
    stateCode,
    workplaceType: "On-site",
    salaryMin,
    salaryMax,
    salaryPeriod,
    publishedAt,
    expiresAt,
    requiredSkills: [],
  }
}

function interleaveSeriesResults(responses: UsaJobsSearchResult[][]) {
  const results: UsaJobsSearchResult[] = []
  const maxResults = Math.max(0, ...responses.map((items) => items.length))

  for (let index = 0; index < maxResults; index += 1) {
    for (const items of responses) {
      const item = items[index]
      if (item) results.push(item)
    }
  }

  return results
}

function stateCodeFromUsaJobs(value: string | undefined) {
  const normalized = value?.trim()
  if (!normalized) return undefined

  const apiCode = normalized.match(/^US-([A-Z]{2})$/)?.[1]
  if (apiCode) return apiCode

  return usStates.find(
    ([code, name]) => normalized === code || normalized.toLowerCase() === name.toLowerCase(),
  )?.[0]
}

function parseSalary(value: string | undefined) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined
}

function salaryPeriodFromUsaJobs(value: string | undefined): "hour" | "year" {
  return value === "PerHour" ? "hour" : "year"
}

function formatSalary(
  minimum: number | undefined,
  maximum: number | undefined,
  period: "hour" | "year",
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
  const suffix = period === "hour" ? "per hour" : "per year"

  if (minimum !== undefined && maximum !== undefined) {
    return `${formatter.format(minimum)}–${formatter.format(maximum)} ${suffix}`
  }
  if (minimum !== undefined) return `From ${formatter.format(minimum)} ${suffix}`
  if (maximum !== undefined) return `Up to ${formatter.format(maximum)} ${suffix}`
  return "Salary not listed"
}

function formatPostedDate(value: string | undefined) {
  if (!value) return "Published date not listed"

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return "Published date not listed"

  return `Posted ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)}`
}
