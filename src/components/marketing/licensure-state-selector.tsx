"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type LicensureStateOption = {
  abbreviation: string
  guideHref?: string
  name: string
}

export function LicensureStateSelector({ states }: { states: readonly LicensureStateOption[] }) {
  const router = useRouter()
  const [selectedCode, setSelectedCode] = useState("")
  const selectedState = states.find((state) => state.abbreviation === selectedCode)

  return (
    <div className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold tracking-[0.13em] text-primary uppercase">Prefer a list?</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Choose your state</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Select a state to open its licensure guide and official starting points.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="licensure-state">State</label>
        <select
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="licensure-state"
          onChange={(event) => setSelectedCode(event.target.value)}
          value={selectedCode}
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
          ))}
        </select>
        <Button
          className="h-11 shrink-0"
          disabled={!selectedState?.guideHref}
          onClick={() => selectedState?.guideHref && router.push(selectedState.guideHref)}
          type="button"
        >
          View guide <ArrowRight />
        </Button>
      </div>
    </div>
  )
}
