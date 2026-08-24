"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import {
  formString,
  isUsState,
  messagePath,
} from "@/lib/auth/validation"
import {
  employmentTypes,
  isEducationType,
  type DatePrecision,
} from "@/lib/professional/career-records"

const careerPath = "/dashboard/profile/career"
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const yearPattern = /^(19|20)\d{2}$/

async function requireProfessional() {
  const identity = await requireIdentity(careerPath)
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (
    profile?.account_type !== "professional" ||
    !profile.onboarding_completed
  ) {
    redirect("/onboarding")
  }

  return identity
}

function optional(value: string) {
  return value || null
}

function partialDate(
  year: string,
  month: string,
  required = false,
): { date: string | null; precision: DatePrecision } | null {
  if (!year && !month) {
    return required ? null : { date: null, precision: "month" }
  }

  if (!yearPattern.test(year) || (month && !/^(0[1-9]|1[0-2])$/.test(month))) {
    return null
  }

  return {
    date: `${year}-${month || "01"}-01`,
    precision: month ? "month" : "year",
  }
}

function validDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent = false,
) {
  return (isCurrent || endDate !== null) && (!startDate || !endDate || endDate >= startDate)
}

function finish(kind: "error" | "success", message: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  revalidatePath(careerPath)
  redirect(messagePath(careerPath, kind, message))
}

async function canAddCareerRecord(
  identity: Awaited<ReturnType<typeof requireProfessional>>,
  table:
    | "professional_education"
    | "professional_experience"
    | "professional_licenses"
    | "professional_certifications",
) {
  const { data, error } = await identity.supabase
    .from(table)
    .select("id")
    .eq("user_id", identity.userId)
    .limit(1)

  return !error && (data?.length ?? 0) === 0
}

export async function saveEducation(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "recordId")
  const educationType = formString(formData, "educationType")
  const institution = formString(formData, "institution")
  const program = formString(formData, "program")
  const specialty = formString(formData, "specialty")
  const city = formString(formData, "city")
  const stateCode = formString(formData, "stateCode")
  const country = formString(formData, "country")
  const start = partialDate(
    formString(formData, "startYear"),
    formString(formData, "startMonth"),
  )
  const end = partialDate(
    formString(formData, "endYear"),
    formString(formData, "endMonth"),
  )
  const isCurrent = formData.get("isCurrent") === "on"
  const description = formString(formData, "description")

  if (
    (id && !uuidPattern.test(id)) ||
    !isEducationType(educationType) ||
    institution.length < 2 ||
    institution.length > 180 ||
    program.length < 2 ||
    program.length > 180 ||
    specialty.length > 120 ||
    city.length > 120 ||
    (stateCode && !isUsState(stateCode)) ||
    country.length < 2 ||
    country.length > 100 ||
    description.length > 1200 ||
    !start ||
    !end ||
    !validDateRange(start.date, end.date, isCurrent)
  ) {
    finish("error", "Review the education fields and try again.")
  }
  if (!start || !end) return

  const values = {
    education_type: educationType,
    institution,
    program,
    specialty: optional(specialty),
    city: optional(city),
    state_code: optional(stateCode),
    country,
    start_date: start.date,
    start_date_precision: start.precision,
    end_date: isCurrent ? null : end.date,
    end_date_precision: end.precision,
    is_current: isCurrent,
    description: optional(description),
  }
  if (!(await canAddCareerRecord(identity, "professional_education")) && !id) {
    finish(
      "error",
      "Keep only your most recent education record here. Add earlier education in Résumé Builder.",
    )
  }
  const request = id
    ? identity.supabase
        .from("professional_education")
        .update(values)
        .eq("id", id)
        .eq("user_id", identity.userId)
    : identity.supabase.from("professional_education").insert({
        ...values,
        user_id: identity.userId,
      })
  const { error } = await request

  finish(
    error ? "error" : "success",
    error ? "We could not save this education record." : "Education saved.",
  )
}

export async function saveExperience(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "recordId")
  const organizationName = formString(formData, "organizationName")
  const roleTitle = formString(formData, "roleTitle")
  const employmentType = formString(formData, "employmentType")
  const city = formString(formData, "city")
  const stateCode = formString(formData, "stateCode")
  const start = partialDate(
    formString(formData, "startYear"),
    formString(formData, "startMonth"),
    true,
  )
  const end = partialDate(
    formString(formData, "endYear"),
    formString(formData, "endMonth"),
  )
  const isCurrent = formData.get("isCurrent") === "on"
  const description = formString(formData, "description")

  if (
    (id && !uuidPattern.test(id)) ||
    organizationName.length < 2 ||
    organizationName.length > 180 ||
    roleTitle.length < 2 ||
    roleTitle.length > 160 ||
    (employmentType &&
      !employmentTypes.some((option) => option === employmentType)) ||
    city.length > 120 ||
    (stateCode && !isUsState(stateCode)) ||
    !start ||
    !end ||
    description.length > 1600 ||
    !validDateRange(start.date, end.date, isCurrent)
  ) {
    finish("error", "Review the experience fields and try again.")
  }
  if (!start || !end) return

  const values = {
    organization_name: organizationName,
    role_title: roleTitle,
    employment_type: optional(employmentType),
    city: optional(city),
    state_code: optional(stateCode),
    start_date: start.date,
    start_date_precision: start.precision,
    end_date: isCurrent ? null : end.date,
    end_date_precision: end.precision,
    is_current: isCurrent,
    description: optional(description),
  }
  if (!(await canAddCareerRecord(identity, "professional_experience")) && !id) {
    finish(
      "error",
      "Keep only your most recent experience here. Add earlier roles in Résumé Builder.",
    )
  }
  const request = id
    ? identity.supabase
        .from("professional_experience")
        .update(values)
        .eq("id", id)
        .eq("user_id", identity.userId)
    : identity.supabase.from("professional_experience").insert({
        ...values,
        user_id: identity.userId,
      })
  const { error } = await request

  finish(
    error ? "error" : "success",
    error ? "We could not save this experience." : "Experience saved.",
  )
}

export async function saveLicense(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "recordId")
  const licenseType = formString(formData, "licenseType")
  const licenseNumber = formString(formData, "licenseNumber")
  const issuingState = formString(formData, "issuingState")
  const issued = partialDate(
    formString(formData, "issuedOnYear"),
    formString(formData, "issuedOnMonth"),
  )
  const expires = partialDate(
    formString(formData, "expiresOnYear"),
    formString(formData, "expiresOnMonth"),
  )

  if (
    (id && !uuidPattern.test(id)) ||
    licenseType.length < 2 ||
    licenseType.length > 120 ||
    licenseNumber.length < 2 ||
    licenseNumber.length > 80 ||
    !isUsState(issuingState) ||
    !issued ||
    !expires ||
    (issued.date && expires.date && expires.date < issued.date)
  ) {
    finish("error", "Review the license fields and try again.")
  }
  if (!issued || !expires) return

  const values = {
    license_type: licenseType,
    license_number: licenseNumber,
    issuing_state: issuingState,
    issued_on: issued.date,
    issued_on_precision: issued.precision,
    expires_on: expires.date,
    expires_on_precision: expires.precision,
  }
  if (!(await canAddCareerRecord(identity, "professional_licenses")) && !id) {
    finish(
      "error",
      "Keep only your most recent license here. Add earlier credentials in Résumé Builder.",
    )
  }
  const request = id
    ? identity.supabase
        .from("professional_licenses")
        .update(values)
        .eq("id", id)
        .eq("user_id", identity.userId)
    : identity.supabase.from("professional_licenses").insert({
        ...values,
        user_id: identity.userId,
      })
  const { error } = await request

  finish(
    error ? "error" : "success",
    error ? "We could not save this license." : "License saved.",
  )
}

export async function saveCertification(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "recordId")
  const name = formString(formData, "name")
  const issuingOrganization = formString(formData, "issuingOrganization")
  const credentialId = formString(formData, "credentialId")
  const issued = partialDate(
    formString(formData, "issuedOnYear"),
    formString(formData, "issuedOnMonth"),
  )
  const expires = partialDate(
    formString(formData, "expiresOnYear"),
    formString(formData, "expiresOnMonth"),
  )

  if (
    (id && !uuidPattern.test(id)) ||
    name.length < 2 ||
    name.length > 180 ||
    issuingOrganization.length < 2 ||
    issuingOrganization.length > 180 ||
    credentialId.length > 100 ||
    !issued ||
    !expires ||
    (issued.date && expires.date && expires.date < issued.date)
  ) {
    finish("error", "Review the certification fields and try again.")
  }
  if (!issued || !expires) return

  const values = {
    name,
    issuing_organization: issuingOrganization,
    credential_id: optional(credentialId),
    issued_on: issued.date,
    issued_on_precision: issued.precision,
    expires_on: expires.date,
    expires_on_precision: expires.precision,
  }
  if (!(await canAddCareerRecord(identity, "professional_certifications")) && !id) {
    finish(
      "error",
      "Keep only your most recent certification here. Add earlier credentials in Résumé Builder.",
    )
  }
  const request = id
    ? identity.supabase
        .from("professional_certifications")
        .update(values)
        .eq("id", id)
        .eq("user_id", identity.userId)
    : identity.supabase.from("professional_certifications").insert({
        ...values,
        user_id: identity.userId,
      })
  const { error } = await request

  finish(
    error ? "error" : "success",
    error
      ? "We could not save this certification."
      : "Certification saved.",
  )
}

export async function deleteCareerRecord(formData: FormData) {
  const identity = await requireProfessional()
  const id = formString(formData, "recordId")
  const recordType = formString(formData, "recordType")
  const tables = {
    education: "professional_education",
    experience: "professional_experience",
    license: "professional_licenses",
    certification: "professional_certifications",
  } as const
  const table = tables[recordType as keyof typeof tables]

  if (!uuidPattern.test(id) || !table) {
    finish("error", "The selected career record is invalid.")
  }

  const { error } = await identity.supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", identity.userId)

  finish(
    error ? "error" : "success",
    error ? "We could not remove this career record." : "Career record removed.",
  )
}
