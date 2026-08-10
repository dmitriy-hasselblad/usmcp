import type { Job } from "@/lib/marketing-data"

type CareerProfile = {
  profession: string
  specialty: string | null
  state_code: string
}

export type RecommendedJob = Job & { matchReasons: string[] }

export function recommendJobs(profile: CareerProfile | null, jobs: Job[]): RecommendedJob[] {
  if (!profile) return []
  return jobs.map((job) => {
    const matchReasons: string[] = []
    let score = 0
    const professionMatch = job.profession === profile.profession
    const specialtyMatch = Boolean(profile.specialty && job.specialty === profile.specialty)
    if (professionMatch) { score += 4; matchReasons.push("Matches your profession") }
    if (specialtyMatch) { score += 3; matchReasons.push("Matches your specialty") }
    if (job.stateCode === profile.state_code) { score += 2; matchReasons.push("In your state") }
    return { ...job, matchReasons, score, hasCareerMatch: professionMatch || specialtyMatch }
  }).filter((job) => job.hasCareerMatch)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "en-US"))
    .slice(0, 3).map(({ score: _score, hasCareerMatch: _hasCareerMatch, ...job }) => job)
}
