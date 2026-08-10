"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { categoryForProfession, healthcareCategories, legacyHealthcareProfessions, otherSpecialtyValue, professionsForCategory, specialtiesForProfession } from "@/lib/healthcare-taxonomy"

const selectClassName = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

type Props = { defaultProfession?: string; defaultSpecialty?: string; specialtyLabel?: string }

export function ProfessionSpecialtyFields({ defaultProfession = "", defaultSpecialty = "", specialtyLabel = "Specialty" }: Props) {
  const initialCategory = categoryForProfession(defaultProfession)
  const [category, setCategory] = useState(initialCategory)
  const [profession, setProfession] = useState(defaultProfession)
  const roles = useMemo(() => professionsForCategory(category), [category])
  const specialties = useMemo(() => specialtiesForProfession(profession), [profession])
  const knownSpecialty = specialties.includes(defaultSpecialty)
  const [specialtyChoice, setSpecialtyChoice] = useState(defaultSpecialty ? (knownSpecialty ? defaultSpecialty : otherSpecialtyValue) : "")
  const [otherSpecialty, setOtherSpecialty] = useState(knownSpecialty ? "" : defaultSpecialty)
  const specialty = specialtyChoice === otherSpecialtyValue ? otherSpecialty : specialtyChoice

  function changeCategory(value: string) { setCategory(value); setProfession(""); setSpecialtyChoice(""); setOtherSpecialty("") }
  function changeProfession(value: string) { setProfession(value); setSpecialtyChoice(""); setOtherSpecialty("") }

  return <>
    <label className="grid gap-2 text-sm font-medium">Healthcare category
      <select className={selectClassName} onChange={(event) => changeCategory(event.target.value)} required value={category}>
        <option value="">Select a category</option>
        {healthcareCategories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
    <label className="grid gap-2 text-sm font-medium">Profession
      <select className={selectClassName} name="profession" disabled={!category} onChange={(event) => changeProfession(event.target.value)} required value={profession}>
        <option value="">Select a profession</option>
        {roles.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
        {legacyHealthcareProfessions.includes(profession as never) && <option value={profession}>{profession} (existing value)</option>}
      </select>
    </label>
    <label className="grid gap-2 text-sm font-medium">{specialtyLabel}
      <select className={selectClassName} disabled={!profession} onChange={(event) => setSpecialtyChoice(event.target.value)} value={specialtyChoice}>
        <option value="">Select a specialty (optional)</option>
        {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
        <option value={otherSpecialtyValue}>Other specialty</option>
      </select>
      <input name="specialty" type="hidden" value={specialty}/>
    </label>
    {specialtyChoice === otherSpecialtyValue ? <label className="grid gap-2 text-sm font-medium">Enter your specialty
      <Input className="h-11" maxLength={120} onChange={(event) => setOtherSpecialty(event.target.value)} placeholder="Enter your specialty" required value={otherSpecialty}/>
    </label> : null}
  </>
}
