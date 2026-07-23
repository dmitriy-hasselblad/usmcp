export const accountTypes = ["professional", "employer"] as const

export type AccountType = (typeof accountTypes)[number]

export const usStates = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
  ["DC", "District of Columbia"],
] as const

export const professions = [
  "Physician",
  "Registered Nurse",
  "Nurse Practitioner",
  "Physician Assistant",
  "Pharmacist",
  "Dentist",
  "Therapist",
  "Allied Health Professional",
  "Healthcare Administrator",
  "Student or Trainee",
  "Other Healthcare Professional",
] as const

export const careerStages = [
  "Student or trainee",
  "Early career",
  "Experienced professional",
  "Leadership or executive",
] as const

export const organizationTypes = [
  "Hospital or health system",
  "Clinic or medical group",
  "Academic medical center",
  "Long-term care organization",
  "Staffing or recruiting firm",
  "Healthcare technology company",
  "Other healthcare organization",
] as const

export function formString(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

export function isAccountType(value: string): value is AccountType {
  return accountTypes.some((accountType) => accountType === value)
}

export function isUsState(value: string) {
  return usStates.some(([code]) => code === value)
}

export function isSafeInternalPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false
  }

  try {
    return new URL(value, "https://ushce.invalid").origin === "https://ushce.invalid"
  } catch {
    return false
  }
}

export function messagePath(
  pathname: string,
  kind: "error" | "success",
  message: string,
) {
  const params = new URLSearchParams({ [kind]: message })
  return `${pathname}?${params.toString()}`
}
