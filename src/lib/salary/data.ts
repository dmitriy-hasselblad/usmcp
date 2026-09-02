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

export function formatSalary(value: number | null | undefined) {
  return value ? new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value) : "Not published"
}
