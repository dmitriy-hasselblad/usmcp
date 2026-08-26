"use client"

import { useMemo, useState } from "react"

import {
  healthcareProfessions,
  specialtiesForProfession,
} from "@/lib/healthcare-taxonomy"

type JobSpecialty = {
  profession: string
  specialty: string
}

type Props = {
  defaultProfession: string
  defaultSpecialty: string
  jobSpecialties: readonly JobSpecialty[]
  selectClassName: string
}

export function ProfessionSpecialtyFilter({
  defaultProfession,
  defaultSpecialty,
  jobSpecialties,
  selectClassName,
}: Props) {
  const [profession, setProfession] = useState(defaultProfession)

  const specialtyOptions = useMemo(() => {
    const taxonomySpecialties = profession
      ? specialtiesForProfession(profession)
      : healthcareProfessions.flatMap((item) => specialtiesForProfession(item))
    const publishedSpecialties = jobSpecialties
      .filter((job) => !profession || job.profession === profession)
      .map((job) => job.specialty)

    return [...new Set([...taxonomySpecialties, ...publishedSpecialties])].sort(
      (a, b) => a.localeCompare(b, "en-US"),
    )
  }, [jobSpecialties, profession])

  const [specialty, setSpecialty] = useState(() =>
    defaultSpecialty && specialtyOptions.includes(defaultSpecialty)
      ? defaultSpecialty
      : "",
  )

  return (
    <>
      <label className="grid gap-2 text-sm font-medium">
        Profession
        <select
          className={selectClassName}
          name="profession"
          onChange={(event) => {
            setProfession(event.target.value)
            setSpecialty("")
          }}
          value={profession}
        >
          <option value="">All professions</option>
          {healthcareProfessions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Specialty
        <select
          className={selectClassName}
          name="specialty"
          onChange={(event) => setSpecialty(event.target.value)}
          value={specialty}
        >
          <option value="">All specialties</option>
          {specialtyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}
