export type ResumeEntry = {
  id: string
  title: string
  organization: string
  location: string
  startDate: string
  endDate: string
  details: string
}

export type ResumeContent = {
  fullName: string
  cityState: string
  phone: string
  email: string
  linkedin: string
  summary: string
  licenses: string
  experience: ResumeEntry[]
  education: ResumeEntry[]
  certifications: string
  skills: string
  languages: string
}

export const emptyResumeContent: ResumeContent = {
  fullName: "",
  cityState: "",
  phone: "",
  email: "",
  linkedin: "",
  summary: "",
  licenses: "",
  experience: [],
  education: [],
  certifications: "",
  skills: "",
  languages: "",
}

const limits = {
  short: 120,
  phone: 30,
  email: 160,
  url: 300,
  summary: 1200,
  list: 3000,
  languages: 1500,
  details: 4000,
} as const

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : ""
}

export function parseResumeContent(value: unknown): ResumeContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyResumeContent
  const record = value as Record<string, unknown>
  const text = (key: keyof ResumeContent, maximum: number) => cleanText(record[key], maximum)
  const entries = (key: "experience" | "education") => Array.isArray(record[key])
    ? record[key].slice(0, 20).map((item) => {
        const entry = item && typeof item === "object" ? item as Record<string, unknown> : {}
        const field = (name: string, maximum: number = limits.short) => cleanText(entry[name], maximum)
        return { id: field("id") || crypto.randomUUID(), title: field("title"), organization: field("organization"), location: field("location"), startDate: field("startDate", 30), endDate: field("endDate", 30), details: field("details", limits.details) }
      }) : []
  return {
    fullName: text("fullName", limits.short),
    cityState: text("cityState", limits.short),
    phone: text("phone", limits.phone),
    email: text("email", limits.email),
    linkedin: text("linkedin", limits.url),
    summary: text("summary", limits.summary),
    licenses: text("licenses", limits.list),
    experience: entries("experience"),
    education: entries("education"),
    certifications: text("certifications", limits.list),
    skills: text("skills", limits.list),
    languages: text("languages", limits.languages),
  }
}
