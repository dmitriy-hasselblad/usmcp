import "server-only"

import { usStates } from "@/lib/auth/validation"
import type { Job } from "@/lib/marketing-data"

type AtsProvider = "greenhouse" | "lever"

type OfficialBoard = {
  provider: AtsProvider
  employer: string
  boardToken: string
}

const OFFICIAL_HEALTHCARE_BOARDS: OfficialBoard[] = [
  { provider: "greenhouse", employer: "Habitat Health", boardToken: "habitathealth" },
  { provider: "lever", employer: "Heartbeat Health", boardToken: "heartbeathealth" },
  { provider: "lever", employer: "Lyra Health", boardToken: "lyrahealth" },
]

type GreenhouseResponse = {
  jobs?: Array<{
    absolute_url?: string
    company_name?: string
    first_published?: string
    id?: number
    location?: { name?: string }
    title?: string
  }>
}

type LeverResponseItem = {
  applyUrl?: string
  categories?: { commitment?: string; location?: string }
  createdAt?: number
  hostedUrl?: string
  id?: string
  text?: string
  workplaceType?: string
}

export type OfficialAtsOpportunity = Job & {
  source: "greenhouse" | "lever"
  externalUrl: string
  sourceName: string
}

/**
 * A curated set of public employer job boards. We retain card-level metadata
 * only; each person continues to the employer's own listing to read and apply.
 */
export async function getOfficialAtsHealthcareOpportunities(): Promise<OfficialAtsOpportunity[]> {
  const results = await Promise.all(
    OFFICIAL_HEALTHCARE_BOARDS.map((board) =>
      board.provider === "greenhouse" ? getGreenhouseJobs(board) : getLeverJobs(board),
    ),
  )

  return results.flat().slice(0, 80)
}

async function getGreenhouseJobs(board: OfficialBoard) {
  try {
    const response = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${board.boardToken}/jobs`,
      { next: { revalidate: 3600 } },
    )
    if (!response.ok) {
      console.error("Greenhouse job board request failed", { board: board.boardToken, status: response.status })
      return []
    }
    const payload = (await response.json()) as GreenhouseResponse
    return (payload.jobs ?? [])
      .map((job) => toGreenhouseOpportunity(job, board))
      .filter((job): job is OfficialAtsOpportunity => Boolean(job))
  } catch (error) {
    console.error("Greenhouse job board request failed", { board: board.boardToken, error })
    return []
  }
}

async function getLeverJobs(board: OfficialBoard) {
  try {
    const response = await fetch(
      `https://api.lever.co/v0/postings/${board.boardToken}?mode=json`,
      { next: { revalidate: 3600 } },
    )
    if (!response.ok) {
      console.error("Lever job board request failed", { board: board.boardToken, status: response.status })
      return []
    }
    const payload = (await response.json()) as LeverResponseItem[]
    return payload
      .map((job) => toLeverOpportunity(job, board))
      .filter((job): job is OfficialAtsOpportunity => Boolean(job))
  } catch (error) {
    console.error("Lever job board request failed", { board: board.boardToken, error })
    return []
  }
}

function toGreenhouseOpportunity(
  job: NonNullable<GreenhouseResponse["jobs"]>[number],
  board: OfficialBoard,
): OfficialAtsOpportunity | undefined {
  const title = job.title?.trim()
  const identifier = job.id?.toString()
  const externalUrl = job.absolute_url?.trim()
  if (!title || !identifier || !externalUrl || !isHealthcareRole(title)) return undefined

  return toOpportunity({
    provider: "greenhouse", board, identifier, title, location: job.location?.name,
    externalUrl, publishedAt: job.first_published,
  })
}

function toLeverOpportunity(job: LeverResponseItem, board: OfficialBoard): OfficialAtsOpportunity | undefined {
  const title = job.text?.trim()
  const identifier = job.id?.trim()
  const externalUrl = job.hostedUrl?.trim() || job.applyUrl?.trim()
  if (!title || !identifier || !externalUrl || !isHealthcareRole(title)) return undefined

  return toOpportunity({
    provider: "lever", board, identifier, title, location: job.categories?.location,
    type: job.categories?.commitment, externalUrl,
    publishedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
    workplaceType: job.workplaceType,
  })
}

function toOpportunity({
  provider, board, identifier, title, location, type, externalUrl, publishedAt, workplaceType,
}: {
  provider: AtsProvider
  board: OfficialBoard
  identifier: string
  title: string
  location?: string
  type?: string
  externalUrl: string
  publishedAt?: string
  workplaceType?: string
}): OfficialAtsOpportunity {
  const normalizedLocation = location?.trim() || "United States"
  const stateCode = stateCodeFromLocation(normalizedLocation) ?? ""

  return {
    slug: `${provider}-${board.boardToken}-${identifier}`,
    title,
    employer: board.employer,
    employerSlug: "",
    location: normalizedLocation,
    salary: "Salary not listed",
    type: type?.trim() || "Schedule not listed",
    specialty: specialtyForTitle(title),
    setting: "Official employer opportunity",
    posted: formatPostedDate(publishedAt),
    summary: `Official public job listing from ${board.employer}. Open the employer's career page for complete details and to apply.`,
    responsibilities: [],
    qualifications: [],
    benefits: [],
    source: provider,
    sourceName: board.employer,
    externalUrl,
    profession: professionForTitle(title),
    experienceLevel: "Not listed",
    city: cityFromLocation(normalizedLocation, stateCode),
    stateCode,
    workplaceType: normalizeWorkplaceType(workplaceType, normalizedLocation),
    salaryPeriod: "year",
    publishedAt,
    requiredSkills: [],
  }
}

function isHealthcareRole(title: string) {
  return /\b(nurse|nursing|physician|psychiatr\w*|psycholog\w*|therapist|clinical|clinician|medical|health|care manager|patient care|pharmac\w*|respiratory|cardiac|cardiolog\w*|sonographer|radiolog\w*|dietitian|behavioral)\b/i.test(title)
}

function professionForTitle(title: string) {
  const value = title.toLocaleLowerCase("en-US")
  if (/nurse practitioner|\bnp\b/.test(value)) return "Nurse Practitioner"
  if (/registered nurse|\brn\b/.test(value)) return "Registered Nurse"
  if (/physician assistant|physician associate|\bpa-c\b/.test(value)) return "Physician Associate"
  if (/psychiatrist|physician|\bmd\b|\bdo\b/.test(value)) return "Physician"
  if (/psychologist/.test(value)) return "Psychologist"
  if (/clinical social worker|\blcsw\b/.test(value)) return "Licensed Clinical Social Worker"
  if (/counselor|therapist|behavioral/.test(value)) return "Mental Health Counselor"
  if (/physical therapist/.test(value)) return "Physical Therapist"
  if (/occupational therapist/.test(value)) return "Occupational Therapist"
  if (/respiratory therapist/.test(value)) return "Respiratory Therapist"
  if (/pharmac/.test(value)) return "Pharmacist"
  if (/medical assistant/.test(value)) return "Medical Assistant"
  if (/clinical research/.test(value)) return "Clinical Research Coordinator"
  return "Other Healthcare Professional"
}

function specialtyForTitle(title: string) {
  if (/psychiatr|psycholog|therapist|behavioral|mental health/i.test(title)) return "Mental Health"
  if (/cardio/i.test(title)) return "Cardiology"
  if (/nurs/i.test(title)) return "Nursing"
  if (/clinical/i.test(title)) return "Clinical Care"
  return "Healthcare"
}

function stateCodeFromLocation(location: string) {
  const normalized = location.toLocaleLowerCase("en-US")
  return usStates.find(([code, name]) => {
    const stateName = name.toLocaleLowerCase("en-US")
    return new RegExp(`(^|[\\s,(/])${code.toLocaleLowerCase("en-US")}($|[\\s,)/])`).test(normalized) || normalized.includes(stateName)
  })?.[0]
}

function cityFromLocation(location: string, stateCode: string) {
  if (!stateCode) return location.toLocaleLowerCase("en-US").includes("remote") ? "Remote" : "United States"
  return location.split(",")[0]?.trim() || stateCode
}

function normalizeWorkplaceType(value: string | undefined, location: string) {
  if (value === "remote" || /remote/i.test(location)) return "Remote"
  if (value === "hybrid") return "Hybrid"
  return "On-site"
}

function formatPostedDate(value: string | undefined) {
  if (!value) return "Published date not listed"
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return "Published date not listed"
  return `Posted ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)}`
}
