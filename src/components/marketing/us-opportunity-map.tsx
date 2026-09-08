import Link from "next/link"

import { geoAlbersUsa, geoPath } from "d3-geo"
import { ArrowRight, MapPinned } from "lucide-react"
import statesTopology from "us-atlas/states-10m.json"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"

type StateSummary = {
  code: string
  count: number
  name: string
}

type StateProperties = {
  name?: string
}

const fipsToStateCode: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
}

const topology = statesTopology as unknown as Topology<{
  states: GeometryCollection<StateProperties>
}>
const stateFeatures = feature(topology, topology.objects.states).features
const projection = geoAlbersUsa().translate([487.5, 305]).scale(1280)
const path = geoPath(projection)

function stateFill(count: number, maxCount: number) {
  if (!count) return "#f8fafc"

  const intensity = count / maxCount
  if (intensity >= 0.67) return "#0f766e"
  if (intensity >= 0.34) return "#0d9488"
  return "#5eead4"
}

export function UsOpportunityMap({ states }: { states: readonly StateSummary[] }) {
  const stateByCode = new Map(states.map((state) => [state.code, state]))
  const maxCount = Math.max(...states.map((state) => state.count), 1)
  const activeStateCount = states.filter((state) => state.count > 0).length
  const activeOpportunityCount = states.reduce((total, state) => total + state.count, 0)

  return (
    <div className="mt-10 grid gap-8 rounded-[2rem] border border-border bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_17rem] lg:p-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-teal-600" /> Active opportunities</span>
          <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border border-slate-300 bg-slate-50" /> No current roles</span>
          <span>{activeOpportunityCount} opportunities across {activeStateCount} states</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <svg
            aria-label="Interactive map of current healthcare opportunities by U.S. state"
            className="min-w-[720px] text-slate-700"
            role="img"
            viewBox="0 0 975 610"
          >
            <title>Current healthcare opportunities by state</title>
            <desc>Each state is a link to its filtered healthcare opportunity results. Teal states have active opportunities, and the circle shows the number of roles.</desc>
            {stateFeatures.map((state) => {
              const id = String(state.id).padStart(2, "0")
              const code = fipsToStateCode[id]
              if (!code) return null

              const summary = stateByCode.get(code)
              const count = summary?.count ?? 0
              const stateName = summary?.name ?? state.properties?.name ?? code
              const statePath = path(state)
              const [centroidX, centroidY] = path.centroid(state)
              const isLive = count > 0

              return (
                <Link
                  aria-label={`Explore ${count} active healthcare ${count === 1 ? "opportunity" : "opportunities"} in ${stateName}`}
                  href={`/jobs?state=${code}`}
                  key={code}
                >
                  <path
                    className="stroke-slate-300 transition-colors hover:fill-teal-700 focus:fill-teal-700"
                    d={statePath ?? undefined}
                    fill={stateFill(count, maxCount)}
                    strokeWidth={1}
                  >
                    <title>{`${stateName}: ${count} active ${count === 1 ? "opportunity" : "opportunities"}`}</title>
                  </path>
                  {isLive && Number.isFinite(centroidX) && Number.isFinite(centroidY) ? (
                    <g aria-hidden="true" className="pointer-events-none">
                      <circle cx={centroidX} cy={centroidY} fill="#fbbf24" r={10} stroke="white" strokeWidth={2} />
                      <text dominantBaseline="central" fill="#0f172a" fontSize={10} fontWeight={800} textAnchor="middle" x={centroidX} y={centroidY}>
                        {count}
                      </text>
                    </g>
                  ) : null}
                </Link>
              )
            })}
          </svg>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Select any state to refine the jobs directory. Count markers include matching SM VIA and USAJOBS opportunities.</p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <MapPinned className="size-7 text-teal-700" />
        <p className="mt-5 text-xs font-bold tracking-[0.14em] text-primary uppercase">Live opportunity signal</p>
        <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">{states.length ? "Explore where healthcare teams are hiring." : "Search any U.S. state."}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{states.length ? "Color shows current availability. Select a state to see its roles, then refine by profession or specialty." : "State availability will light up as opportunities are published."}</p>
        <Link className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" href="/jobs">Browse all roles <ArrowRight className="size-4" /></Link>
      </div>
    </div>
  )
}
