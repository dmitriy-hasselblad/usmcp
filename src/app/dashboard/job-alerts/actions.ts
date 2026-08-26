"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, isUsState, messagePath } from "@/lib/auth/validation"
import { requireIdentity } from "@/lib/auth/session"
import { employmentTypes, experienceLevels, workplaceTypes } from "@/lib/employer/constants"
import { isHealthcareProfession } from "@/lib/healthcare-taxonomy"

const availabilityOptions = [
  "Not specified",
  "Immediately",
  "Within 30 days",
  "Within 1 to 3 months",
  "More than 3 months",
] as const

function selectedValues(formData: FormData, name: string, allowed: readonly string[]) {
  return [...new Set(formData.getAll(name).filter((value): value is string => typeof value === "string"))]
    .filter((value) => allowed.includes(value))
}

async function requireProfessional() {
  const identity = await requireIdentity("/dashboard/job-alerts")
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()
  if (profile?.account_type !== "professional" || !profile.onboarding_completed) redirect("/onboarding")
  return identity
}

export async function saveJobPreferences(formData: FormData) {
  const identity = await requireProfessional()
  const employment = selectedValues(formData, "preferredEmploymentTypes", employmentTypes)
  const workplace = selectedValues(formData, "preferredWorkplaceTypes", workplaceTypes)
  const availability = formString(formData, "availabilityTiming")
  if (!availabilityOptions.includes(availability as (typeof availabilityOptions)[number])) {
    redirect(messagePath("/dashboard/job-alerts", "error", "Review the job preferences and try again."))
  }
  const { error } = await identity.supabase.from("professional_profiles").update({
    preferred_employment_types: employment,
    preferred_workplace_types: workplace,
    willing_to_relocate: formData.get("willingToRelocate") === "on",
    availability_timing: availability,
  }).eq("user_id", identity.userId)
  if (error) redirect(messagePath("/dashboard/job-alerts", "error", "We could not save your job preferences."))
  revalidatePath("/dashboard/job-alerts")
  redirect(messagePath("/dashboard/job-alerts", "success", "Job preferences saved."))
}

export async function createSavedJobSearch(formData: FormData) {
  const identity = await requireProfessional()
  const name = formString(formData, "name")
  const profession = formString(formData, "profession")
  const specialty = formString(formData, "specialty")
  const stateCode = formString(formData, "stateCode")
  const city = formString(formData, "city")
  const employmentType = formString(formData, "employmentType")
  const workplaceType = formString(formData, "workplaceType")
  const experienceLevel = formString(formData, "experienceLevel")
  const searchText = formString(formData, "searchText")
  const visa = formString(formData, "visaSupport")
  if (
    name.length < 2 || name.length > 80 ||
    (profession && !isHealthcareProfession(profession)) ||
    specialty.length > 120 ||
    (stateCode && !isUsState(stateCode)) ||
    (city && (city.length < 2 || city.length > 120)) ||
    (employmentType && !employmentTypes.includes(employmentType as never)) ||
    (workplaceType && !workplaceTypes.includes(workplaceType as never)) ||
    (experienceLevel && !experienceLevels.includes(experienceLevel as never)) ||
    (searchText && (searchText.length < 2 || searchText.length > 120)) ||
    !["", "yes", "no"].includes(visa)
  ) redirect(messagePath("/dashboard/job-alerts", "error", "Review the saved search and try again."))

  const { count } = await identity.supabase.from("saved_job_searches").select("id", { count: "exact", head: true }).eq("user_id", identity.userId)
  if ((count ?? 0) >= 10) redirect(messagePath("/dashboard/job-alerts", "error", "You can save up to 10 job searches."))
  const { error } = await identity.supabase.from("saved_job_searches").insert({
    user_id: identity.userId, name, profession: profession || null, specialty: specialty || null,
    state_code: stateCode || null, city: city || null, employment_type: employmentType || null,
    workplace_type: workplaceType || null, experience_level: experienceLevel || null,
    visa_support: visa === "" ? null : visa === "yes", search_text: searchText || null,
    alerts_enabled: formData.get("alertsEnabled") === "on",
  })
  if (error) redirect(messagePath("/dashboard/job-alerts", "error", "We could not save this job search."))
  revalidatePath("/dashboard/job-alerts")
  redirect(messagePath("/dashboard/job-alerts", "success", "Saved search created. You will see matching new jobs in Notifications."))
}

export async function deleteSavedJobSearch(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "id")
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) redirect(messagePath("/dashboard/job-alerts", "error", "The saved search is invalid."))
  const { error } = await identity.supabase.from("saved_job_searches").delete().eq("id", id).eq("user_id", identity.userId)
  if (error) redirect(messagePath("/dashboard/job-alerts", "error", "We could not remove this saved search."))
  revalidatePath("/dashboard/job-alerts")
  redirect(messagePath("/dashboard/job-alerts", "success", "Saved search removed."))
}
