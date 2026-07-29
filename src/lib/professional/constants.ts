export const professionalDocumentsBucket = "professional-documents"
export const professionalDocumentMaxBytes = 8 * 1024 * 1024

export const professionalDocumentTypes = [
  "resume",
  "license",
  "certification",
  "other",
] as const

export type ProfessionalDocumentType =
  (typeof professionalDocumentTypes)[number]

export const professionalDocumentTypeLabels: Record<
  ProfessionalDocumentType,
  string
> = {
  resume: "Resume or CV",
  license: "Professional license",
  certification: "Certification",
  other: "Other credential",
}

export const resumeMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const credentialMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const

export function isProfessionalDocumentType(
  value: string,
): value is ProfessionalDocumentType {
  return professionalDocumentTypes.some((type) => type === value)
}

export function isAllowedProfessionalDocument(
  documentType: ProfessionalDocumentType,
  mimeType: string,
) {
  const allowed =
    documentType === "resume" ? resumeMimeTypes : credentialMimeTypes

  return allowed.some((type) => type === mimeType)
}

export type ProfessionalDocumentRecord = {
  id: string
  user_id: string
  document_type: ProfessionalDocumentType
  title: string
  storage_path: string
  file_name: string
  mime_type: string
  file_size: number
  is_primary: boolean
  created_at: string
  updated_at: string
}

export type ProfessionalProfileRecord = {
  user_id: string
  profession: string
  specialty: string | null
  state_code: string
  career_stage: string
  headline: string | null
  city: string | null
  phone: string | null
  biography: string | null
  years_experience: number | null
  created_at: string
  updated_at: string
}
