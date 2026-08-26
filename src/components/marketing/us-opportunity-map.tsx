import Link from "next/link"

import { ArrowRight, MapPinned } from "lucide-react"

type StateSummary = {
  code: string
  count: number
  name: string
}

const stateLayout = [
  "WA", "MT", "ND", "MN", "WI", "MI", "NY", "VT", "NH", "ME",
  "OR", "ID", "SD", "IA", "IL", "IN", "OH", "PA", "NJ", "MA",
  "CA", "NV", "WY", "NE", "MO", "KY", "WV", "VA", "MD", "CT", "RI",
  "AZ", "UT", "CO", "KS", "AR", "TN", "NC", "SC", "DE",
  "AK", "HI", "NM", "OK", "LA", "MS", "AL", "GA", "DC",
  "TX", "FL",
] as const

export function UsOpportunityMap({ states }: { states: readonly StateSummary[] }) {
  const stateByCode = new Map(states.map((state) => [state.code, state]))

  return (
    <div className="mt-10 grid gap-8 rounded-[2rem] border border-border bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_17rem] lg:p-8">
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[660px] grid-cols-10 gap-2">
          {stateLayout.map((code) => {
            const state = stateByCode.get(code)
            const isLive = Boolean(state?.count)
            return (
              <Link
                aria-label={`Explore jobs in ${state?.name ?? code}`}
                className={
                  isLive
                    ? "group relative grid min-h-12 place-items-center rounded-lg border border-teal-300 bg-teal-600 px-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700"
                    : "grid min-h-12 place-items-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-500 transition hover:border-primary/30 hover:bg-slate-100 hover:text-primary"
                }
                href={`/jobs?state=${code}`}
                key={code}
                title={state?.name ?? code}
              >
                {code}
                {isLive ? <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-amber-300 text-[9px] font-extrabold text-slate-950">{state?.count}</span> : null}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <MapPinned className="size-7 text-teal-700" />
        <p className="mt-5 text-xs font-bold tracking-[0.14em] text-primary uppercase">Live opportunity signal</p>
        <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">{states.length ? "Explore where employers are hiring." : "Search any U.S. state."}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{states.length ? "Teal states have published opportunities. Select any state to refine your search." : "State availability will light up as employers publish opportunities."}</p>
        <Link className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" href="/jobs">Browse all roles <ArrowRight className="size-4" /></Link>
      </div>
    </div>
  )
}
