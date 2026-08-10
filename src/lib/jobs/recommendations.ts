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
    if (job.profession === profile.profession) { score += 4; matchReasons.push("Matches your profession") }
    if (profile.specialty && job.specialty === profile.specialty) { score += 3; matchReasons.push("Matches your specialty") }
    if (job.stateCode === profile.state_code) { score += 2; matchReasons.push("In your state") }
    return { ...job, matchReasons, score }
  }).filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "en-US"))
    .slice(0, 3).map(({ score: _score, ...job }) => job)
}
