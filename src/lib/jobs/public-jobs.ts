import { cache } from "react"

import { usStates } from "@/lib/auth/validation"
import type { Job } from "@/lib/marketing-data"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import { isPlatformDemonstrationOrganization } from "@/lib/platform-content"

export type PublishedJobRow = {
  id: string
  slug: string
  title: string
  specialty: string | null
  city: string
  state_code: string
  employment_type: string
  workplace_type: string
  salary_min: number | null
  salary_max: number | null
  salary_period: "hour" | "year"
  visa_support: boolean
  description: string | null
  published_at: string
  expires_at: string
  organization_id: string
  organization_name: string
  organization_slug: string
  organization_type: string
  organization_state_code?: string
  organization_description?: string | null
  organization_website: string | null
  verification_status: string
  profession: string
  experience_level: string
  required_skills: string[]
}

export const getPublishedJobs = cache(async (): Promise<Job[]> => {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("published_jobs")
    .select(
      "id, slug, title, specialty, city, state_code, employment_type, workplace_type, salary_min, salary_max, salary_period, visa_support, description, published_at, expires_at, organization_id, organization_name, organization_slug, organization_type, organization_website, verification_status, profession, experience_level, required_skills",
    )
    .order("published_at", { ascending: false })
    .limit(200)

  if (error || !data) {
    return []
  }

  return (data as PublishedJobRow[])
    .map(toMarketplaceJob)
    .filter((job) => !job.isPlatformDemo)
})

export const getPublishedJobBySlug = cache(
  async (slug: string): Promise<Job | undefined> => {
    if (!isSupabaseConfigured()) {
      return undefined
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("published_jobs")
      .select(
        "id, slug, title, specialty, city, state_code, employment_type, workplace_type, salary_min, salary_max, salary_period, visa_support, description, published_at, expires_at, organization_id, organization_name, organization_slug, organization_type, organization_website, verification_status, profession, experience_level, required_skills",
      )
      .eq("slug", slug)
      .maybeSingle()

    if (error || !data) {
      return undefined
    }

    const job = toMarketplaceJob(data as PublishedJobRow)
    return job.isPlatformDemo ? undefined : job
  },
)

export function toMarketplaceJob(row: PublishedJobRow): Job {
  const stateName =
    usStates.find(([code]) => code === row.state_code)?.[1] ?? row.state_code

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    employer: row.organization_name,
    employerSlug: row.organization_slug,
    organizationType: row.organization_type,
    organizationWebsite: row.organization_website ?? undefined,
    organizationVerificationStatus: row.verification_status,
    organizationId: row.organization_id,
    location: `${row.city}, ${stateName}`,
    salary: formatSalary(row),
    type: row.employment_type,
    specialty: row.specialty || "Healthcare",
    setting: row.workplace_type,
    posted: `Published ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(row.published_at))}`,
    summary:
      row.description?.trim() ||
      "This employer has published a new healthcare opportunity on SMVIA.",
    responsibilities: [],
    qualifications: [],
    benefits: [],
    visaSupport: row.visa_support,
    source: "live",
    profession: row.profession,
    experienceLevel: row.experience_level,
    city: row.city,
    stateCode: row.state_code,
    workplaceType: row.workplace_type,
    salaryMin: row.salary_min ?? undefined,
    salaryMax: row.salary_max ?? undefined,
    salaryPeriod: row.salary_period,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    isPlatformDemo: isPlatformDemonstrationOrganization(row.organization_name),
    requiredSkills: row.required_skills ?? [],
  }
}

function formatSalary(row: PublishedJobRow) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
  const suffix = row.salary_period === "hour" ? "per hour" : "per year"

  if (row.salary_min !== null && row.salary_max !== null) {
    return `${formatter.format(row.salary_min)}–${formatter.format(
      row.salary_max,
    )} ${suffix}`
  }

  if (row.salary_min !== null) {
    return `From ${formatter.format(row.salary_min)} ${suffix}`
  }

  if (row.salary_max !== null) {
    return `Up to ${formatter.format(row.salary_max)} ${suffix}`
  }

  return "Salary not listed"
}
