export const applicationStatuses = [
  "submitted",
  "reviewing",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const

export type ApplicationStatus = (typeof applicationStatuses)[number]

export const employerApplicationStatuses = [
  "submitted",
  "reviewing",
  "interview",
  "offer",
  "rejected",
] as const

export const withdrawableApplicationStatuses: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "interview",
  "offer",
]

export function isEmployerApplicationStatus(
  value: string,
): value is (typeof employerApplicationStatuses)[number] {
  return employerApplicationStatuses.some((status) => status === value)
}

export type ApplicationRecord = {
  id: string
  job_id: string
  organization_id: string
  candidate_id: string
  job_slug: string
  job_title: string
  organization_name: string
  candidate_first_name: string
  candidate_last_name: string
  candidate_email: string
  profession: string
  specialty: string | null
  career_stage: string
  state_code: string
  phone: string
  resume_url: string | null
  cover_letter: string
  status: ApplicationStatus
  submitted_at: string
  updated_at: string
}
