import salaryData from "./bls-oews-may-2025.json"

type NationalWages = {
  mean: number | null
  p10: number | null
  p25: number | null
  median: number | null
  p75: number | null
  p90: number | null
}

export type SalaryOccupation = {
  slug: string
  name: string
  soc: string
  national: NationalWages
  stateMedianAnnual: Record<string, number | null>
}

export type SalaryState = {
  code: string
  name: string
}

export const salarySource = {
  name: salaryData.sourceName,
  url: salaryData.sourceUrl,
  release: salaryData.release,
  retrievedAt: salaryData.retrievedAt,
}

export const salaryStates = salaryData.states as SalaryState[]
export const salaryOccupations = salaryData.occupations as SalaryOccupation[]

export function getSalaryOccupation(slug: string) {
  return salaryOccupations.find((occupation) => occupation.slug === slug)
}

export function getSalaryState(code: string) {
  return salaryStates.find((state) => state.code === code.toUpperCase())
}

const relatedOccupationSlugs: Record<string, string[]> = {
  "registered-nurse": ["nurse-practitioner", "licensed-practical-nurse", "nursing-assistant"],
  "nurse-practitioner": ["registered-nurse", "physician-assistant", "licensed-practical-nurse"],
  "physician-assistant": ["nurse-practitioner", "registered-nurse", "medical-health-services-manager"],
  "licensed-practical-nurse": ["registered-nurse", "nursing-assistant", "medical-assistant"],
  "medical-assistant": ["nursing-assistant", "licensed-practical-nurse", "emergency-medical-technician"],
  "nursing-assistant": ["licensed-practical-nurse", "medical-assistant", "registered-nurse"],
  "dental-hygienist": ["medical-assistant", "registered-nurse", "health-information-technologist"],
  "physical-therapist": ["occupational-therapist", "speech-language-pathologist", "respiratory-therapist"],
  "occupational-therapist": ["physical-therapist", "speech-language-pathologist", "respiratory-therapist"],
  "speech-language-pathologist": ["occupational-therapist", "physical-therapist", "respiratory-therapist"],
  pharmacist: ["clinical-laboratory-technologist", "health-information-technologist", "medical-scientist"],
  "radiologic-technologist": ["diagnostic-medical-sonographer", "clinical-laboratory-technologist", "surgical-technologist"],
  "diagnostic-medical-sonographer": ["radiologic-technologist", "clinical-laboratory-technologist", "physical-therapist"],
  "respiratory-therapist": ["physical-therapist", "occupational-therapist", "registered-nurse"],
  "clinical-laboratory-technologist": ["medical-scientist", "radiologic-technologist", "diagnostic-medical-sonographer"],
  "emergency-medical-technician": ["surgical-technologist", "medical-assistant", "registered-nurse"],
  "surgical-technologist": ["emergency-medical-technician", "radiologic-technologist", "registered-nurse"],
  "medical-health-services-manager": ["health-information-technologist", "medical-scientist", "registered-nurse"],
  "health-information-technologist": ["medical-health-services-manager", "clinical-laboratory-technologist", "medical-scientist"],
  "medical-scientist": ["clinical-laboratory-technologist", "health-information-technologist", "medical-health-services-manager"],
}

export function getRelatedSalaryOccupations(
  occupation: SalaryOccupation,
  limit = 3,
) {
  const relatedSlugs = relatedOccupationSlugs[occupation.slug] ?? []

  return relatedSlugs
    .map((slug) => getSalaryOccupation(slug))
    .filter((item): item is SalaryOccupation => Boolean(item))
    .slice(0, limit)
}

export function formatSalary(value: number | null | undefined) {
  return value ? new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value) : "Not published"
}
