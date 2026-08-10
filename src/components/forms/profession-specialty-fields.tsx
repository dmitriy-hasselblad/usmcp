"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { healthcareProfessions, legacyHealthcareProfessions, otherSpecialtyValue, specialtiesForProfession } from "@/lib/healthcare-taxonomy"

const selectClassName = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

export function ProfessionSpecialtyFields({ defaultProfession = "", defaultSpecialty = "", specialtyLabel = "Specialty" }: { defaultProfession?: string; defaultSpecialty?: string; specialtyLabel?: string }) {
  const [profession, setProfession] = useState(defaultProfession)
  const specialties = useMemo(() => specialtiesForProfession(profession), [profession])
  const known = specialties.includes(defaultSpecialty as never)
  const [specialtyChoice, setSpecialtyChoice] = useState(defaultSpecialty ? (known ? defaultSpecialty : otherSpecialtyValue) : "")
  const [otherSpecialty, setOtherSpecialty] = useState(known ? "" : defaultSpecialty)
  const changeProfession = (value: string) => { setProfession(value); setSpecialtyChoice(""); setOtherSpecialty("") }
  const specialty = specialtyChoice === otherSpecialtyValue ? otherSpecialty : specialtyChoice
  return <><label className="grid gap-2 text-sm font-medium">Profession<select className={selectClassName} name="profession" onChange={(e) => changeProfession(e.target.value)} required value={profession}><option value="">Select a profession</option>{healthcareProfessions.map((item) => <option key={item} value={item}>{item}</option>)}{legacyHealthcareProfessions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">{specialtyLabel}<select className={selectClassName} disabled={!profession} onChange={(e) => setSpecialtyChoice(e.target.value)} value={specialtyChoice}><option value="">Select a specialty</option>{specialties.map((item) => <option key={item} value={item}>{item}</option>)}<option value={otherSpecialtyValue}>Other specialty</option></select><input name="specialty" type="hidden" value={specialty}/></label>{specialtyChoice === otherSpecialtyValue && <label className="grid gap-2 text-sm font-medium">Enter your specialty<Input className="h-11" maxLength={120} onChange={(e) => setOtherSpecialty(e.target.value)} placeholder="Enter your specialty" required value={otherSpecialty}/></label>}</>
}
