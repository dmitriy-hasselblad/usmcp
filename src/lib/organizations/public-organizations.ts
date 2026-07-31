import { cache } from "react"

import { usStates } from "@/lib/auth/validation"
import {
  type PublishedJobRow,
  toMarketplaceJob,
} from "@/lib/jobs/public-jobs"
import type { Job } from "@/lib/marketing-data"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export type PublicOrganization = {
  id: string
  slug: string
  name: string
  type: string
  description: string | null
  website: string | null
  location: string
  verificationStatus: string
  jobs: Job[]
}

const publicOrganizationSelection =
  "id, slug, title, specialty, city, state_code, employment_type, workplace_type, salary_min, salary_max, salary_period, visa_support, description, published_at, organization_id, organization_name, organization_slug, organization_type, organization_state_code, organization_description, organization_website, verification_status"

export const getPublicOrganizations = cache(
  async (): Promise<PublicOrganization[]> => {
    const rows = await getPublicOrganizationRows()
    const organizations = new Map<string, PublicOrganization>()

    for (const row of rows) {
      const organization = organizations.get(row.organization_id)
      const job = toMarketplaceJob(row)

      if (organization) {
        organization.jobs.push(job)
        continue
      }

      organizations.set(row.organization_id, {
        id: row.organization_id,
        slug: row.organization_slug,
        name: row.organization_name,
        type: row.organization_type,
        description: row.organization_description?.trim() || null,
        website: getSafeWebsite(row.organization_website),
        location: formatOrganizationLocation(row.organization_state_code),
        verificationStatus: row.verification_status,
        jobs: [job],
      })
    }

    return [...organizations.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "en-US"),
    )
  },
)

export const getPublicOrganizationBySlug = cache(
  async (slug: string): Promise<PublicOrganization | undefined> => {
    const organizations = await getPublicOrganizations()
    return organizations.find((organization) => organization.slug === slug)
  },
)

async function getPublicOrganizationRows(): Promise<PublishedJobRow[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("published_jobs")
    .select(publicOrganizationSelection)
    .order("published_at", { ascending: false })
    .limit(200)

  if (error || !data) {
    return []
  }

  return data as PublishedJobRow[]
}

function formatOrganizationLocation(stateCode?: string) {
  if (!stateCode) {
    return "United States"
  }

  return usStates.find(([code]) => code === stateCode)?.[1] ?? stateCode
}

function getSafeWebsite(value: string | null) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}
