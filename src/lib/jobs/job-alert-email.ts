import "server-only"

import { sendJobSearchMatchEmail } from "@/lib/email/application-status"
import { createAdminClient } from "@/lib/supabase/admin"

type SavedSearch = {
  id: string
  user_id: string
  name: string
  profession: string | null
  specialty: string | null
  state_code: string | null
  city: string | null
  employment_type: string | null
  workplace_type: string | null
  experience_level: string | null
  visa_support: boolean | null
  search_text: string | null
}

export type PublishedJobForAlert = {
  id: string
  slug: string
  title: string
  profession: string
  specialty: string | null
  stateCode: string
  city: string
  employmentType: string
  workplaceType: string
  experienceLevel: string
  visaSupport: boolean
  description: string | null
  organizationName: string
  publishedAt: string
}

function matchesSearch(search: SavedSearch, job: PublishedJobForAlert) {
  const searchableText = [
    job.title,
    job.profession,
    job.specialty,
    job.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase()

  return (
    (!search.profession || search.profession === job.profession) &&
    (!search.specialty || search.specialty === job.specialty) &&
    (!search.state_code || search.state_code === job.stateCode) &&
    (!search.city || search.city.toLocaleLowerCase() === job.city.toLocaleLowerCase()) &&
    (!search.employment_type || search.employment_type === job.employmentType) &&
    (!search.workplace_type || search.workplace_type === job.workplaceType) &&
    (!search.experience_level || search.experience_level === job.experienceLevel) &&
    (search.visa_support === null || search.visa_support === job.visaSupport) &&
    (!search.search_text || searchableText.includes(search.search_text.toLocaleLowerCase()))
  )
}

/** Deliver email only for searches where the professional explicitly opted in. */
export async function sendMatchingJobAlertEmails(job: PublishedJobForAlert) {
  const admin = createAdminClient()
  if (!admin) {
    console.error("Job alert email skipped because SUPABASE_SERVICE_ROLE_KEY is not configured")
    return
  }

  const { data: savedSearches, error } = await admin
    .from("saved_job_searches")
    .select("id, user_id, name, profession, specialty, state_code, city, employment_type, workplace_type, experience_level, visa_support, search_text")
    .eq("alerts_enabled", true)
    .eq("email_alerts_enabled", true)

  if (error || !savedSearches?.length) {
    if (error) console.error("Could not load email job alerts", { code: error.code })
    return
  }

  const matches = (savedSearches as SavedSearch[]).filter((search) => matchesSearch(search, job))
  if (!matches.length) return

  const userIds = [...new Set(matches.map((search) => search.user_id))]
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, first_name, account_type, onboarding_completed")
    .in("id", userIds)

  if (profilesError || !profiles) {
    console.error("Could not load job alert recipients", { code: profilesError?.code })
    return
  }

  const eligibleProfiles = new Map(
    profiles
      .filter((profile) => profile.account_type === "professional" && profile.onboarding_completed)
      .map((profile) => [profile.id, profile]),
  )

  await Promise.allSettled(
    matches.map(async (search) => {
      const profile = eligibleProfiles.get(search.user_id)
      if (!profile) return

      const { data, error: userError } = await admin.auth.admin.getUserById(search.user_id)
      const email = data.user?.email
      if (userError || !email) {
        if (userError) console.error("Could not load job alert email recipient", { code: userError.status })
        return
      }

      const delivery = await sendJobSearchMatchEmail({
        savedSearchId: search.id,
        searchName: search.name,
        candidateEmail: email,
        candidateFirstName: profile.first_name ?? "there",
        jobTitle: job.title,
        organizationName: job.organizationName,
        jobSlug: job.slug,
        publishedAt: job.publishedAt,
      })

      if (delivery.outcome === "failed") {
        console.error("Job alert email delivery failed", {
          savedSearchId: search.id,
          code: delivery.code,
        })
      }
    }),
  )
}
