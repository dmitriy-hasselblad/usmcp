import "server-only"

import type { Job } from "@/lib/marketing-data"

const USAJOBS_SEARCH_URL = "https://data.usajobs.gov/api/Search"
const USAJOBS_SOURCE_NAME = "USAJOBS"
const HEALTHCARE_OCCUPATIONAL_SERIES = [
  "0602", // Medical Officer
  "0610", // Nurse
  "0630", // Dietitian and Nutritionist
  "0631", // Occupational Therapist
  "0633", // Physical Therapist
  "0644", // Clinical Laboratory Science
  "0649", // Medical Instrument Technician
  "0660", // Pharmacist
]

type UsaJobsSearchResponse = {
  SearchResult?: {
    SearchResultItems?: UsaJobsSearchItem[]
  }
}

type UsaJobsSearchItem = {
  MatchedObjectId?: string
  MatchedObjectDescriptor?: UsaJobsDescriptor
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
          JobCategoryCode: series,
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
          // Keep unsuccessful API attempts out of the data cache. Once the
          // connection is confirmed, successful responses can be cached by
          // USAJOBS and Vercel at their respective layers.
          cache: "no-store",
        })

        if (!response.ok) {
          console.error("USAJOBS healthcare search failed", {
            series,
            status: response.status,
          })
          return []
        }

        const payload = (await response.json()) as UsaJobsSearchResponse
        return payload.SearchResult?.SearchResultItems ?? []
      }),
    )
    const seen = new Set<string>()

    const items = responses.flat()
    const opportunities = items
      .flat()
      .map(toUsaJobsOpportunity)
      .filter((job): job is UsaJobsOpportunity => Boolean(job))
      .filter((job) => {
        if (seen.has(job.slug)) return false
        seen.add(job.slug)
        return true
      })
      .slice(0, 50)

    console.info("USAJOBS healthcare search completed", {
      matchingItems: items.length,
      publishedOpportunities: opportunities.length,
    })

    return opportunities
  } catch (error) {
    console.error("USAJOBS healthcare search request failed", error)
    return []
  }
}

function toUsaJobsOpportunity(
  item: UsaJobsSearchItem,
): UsaJobsOpportunity | undefined {
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
    specialty: category || "Federal healthcare",
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
    profession: category || "Healthcare",
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

function stateCodeFromUsaJobs(value: string | undefined) {
  const match = value?.match(/^US-([A-Z]{2})$/)
  return match?.[1]
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
