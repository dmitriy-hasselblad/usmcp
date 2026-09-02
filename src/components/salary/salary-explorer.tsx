"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { SalaryOccupation, SalaryState } from "@/lib/salary/data"
import { Button } from "@/components/ui/button"

const selectClassName = "h-12 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

export function SalaryExplorer({
  occupations,
  states,
}: {
  occupations: SalaryOccupation[]
  states: SalaryState[]
}) {
  const router = useRouter()
  const [occupation, setOccupation] = useState(occupations[0]?.slug ?? "")
  const [state, setState] = useState(states[0]?.code ?? "")

  return (
    <form
      className="grid gap-4 rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        if (occupation && state) router.push(`/salary/${occupation}/${state.toLowerCase()}`)
      }}
    >
      <label className="grid gap-2 text-sm font-semibold text-white">
        Profession
        <select className={selectClassName} onChange={(event) => setOccupation(event.target.value)} value={occupation}>
          {occupations.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-white">
        State
        <select className={selectClassName} onChange={(event) => setState(event.target.value)} value={state}>
          {states.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </label>
      <Button className="h-12 bg-teal-500 px-5 text-white hover:bg-teal-400" type="submit">
        View salary data
      </Button>
    </form>
  )
}
