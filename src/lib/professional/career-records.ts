export const educationTypes = [
  "degree",
  "medical_school",
  "residency",
  "fellowship",
  "other_training",
] as const

export type EducationType = (typeof educationTypes)[number]
export type DatePrecision = "year" | "month"

export const educationTypeLabels: Record<EducationType, string> = {
  degree: "College or university degree",
  medical_school: "Medical school",
  residency: "Residency",
  fellowship: "Fellowship",
  other_training: "Other clinical training",
}

export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Locum tenens",
  "Per diem",
  "Volunteer",
] as const

export type EducationRecord = {
  id: string
  user_id: string
  education_type: EducationType
  institution: string
  program: string
  specialty: string | null
  city: string | null
  state_code: string | null
  country: string
  start_date: string | null
  start_date_precision: DatePrecision
  end_date: string | null
  end_date_precision: DatePrecision
  is_current: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export type ExperienceRecord = {
  id: string
  user_id: string
  organization_name: string
  role_title: string
  employment_type: string | null
  city: string | null
  state_code: string | null
  start_date: string
  start_date_precision: DatePrecision
  end_date: string | null
  end_date_precision: DatePrecision
  is_current: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export type LicenseRecord = {
  id: string
  user_id: string
  license_type: string
  license_number: string
  issuing_state: string
  issued_on: string | null
  issued_on_precision: DatePrecision
  expires_on: string | null
  expires_on_precision: DatePrecision
  created_at: string
  updated_at: string
}

export type CertificationRecord = {
  id: string
  user_id: string
  name: string
  issuing_organization: string
  credential_id: string | null
  issued_on: string | null
  issued_on_precision: DatePrecision
  expires_on: string | null
  expires_on_precision: DatePrecision
  created_at: string
  updated_at: string
}

export type StructuredCareerProfile = {
  education: EducationRecord[]
  experience: ExperienceRecord[]
  licenses: LicenseRecord[]
  certifications: CertificationRecord[]
}

export function isEducationType(value: string): value is EducationType {
  return educationTypes.some((type) => type === value)
}
