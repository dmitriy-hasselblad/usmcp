import type { Job } from "@/lib/marketing-data"

export type JobFilters = {
  query: string
  location: string
  profession: string
  specialty: string
  state: string
  employmentType: string
  workplaceType: string
  experienceLevel: string
  salaryMin?: number
  salaryMax?: number
  visaOnly: boolean
}

export function filterJobs(jobs: Job[], filters: JobFilters) {
  const query = normalize(filters.query)
  const location = normalize(filters.location)

  return jobs.filter((job) => {
    const matchesQuery =
      !query ||
      [
        job.title,
        job.employer,
        job.profession,
        job.specialty,
        job.setting,
        job.city,
      ].some((value) => normalize(value).includes(query))
    const matchesLocation =
      !location || normalize(job.location).includes(location)
    const matchesProfession =
      !filters.profession || job.profession === filters.profession
    const matchesSpecialty =
      !filters.specialty || job.specialty === filters.specialty
    const matchesState = !filters.state || job.stateCode === filters.state
    const matchesEmploymentType =
      !filters.employmentType || job.type === filters.employmentType
    const matchesWorkplaceType =
      !filters.workplaceType || job.workplaceType === filters.workplaceType
    const matchesExperience =
      !filters.experienceLevel ||
      job.experienceLevel === filters.experienceLevel
    const matchesSalaryMin =
      filters.salaryMin === undefined ||
      getUpperSalaryBound(job) >= filters.salaryMin
    const matchesSalaryMax =
      filters.salaryMax === undefined ||
      getLowerSalaryBound(job) <= filters.salaryMax
    const matchesSalaryPeriod =
      (filters.salaryMin === undefined && filters.salaryMax === undefined) ||
      job.salaryPeriod === "year"
    const matchesVisa = !filters.visaOnly || job.visaSupport

    return (
      matchesQuery &&
      matchesLocation &&
      matchesProfession &&
      matchesSpecialty &&
      matchesState &&
      matchesEmploymentType &&
      matchesWorkplaceType &&
      matchesExperience &&
      matchesSalaryMin &&
      matchesSalaryMax &&
      matchesSalaryPeriod &&
      matchesVisa
    )
  })
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-US")
}

function getLowerSalaryBound(job: Job) {
  return job.salaryMin ?? job.salaryMax ?? Number.POSITIVE_INFINITY
}

function getUpperSalaryBound(job: Job) {
  return job.salaryMax ?? job.salaryMin ?? Number.NEGATIVE_INFINITY
}
