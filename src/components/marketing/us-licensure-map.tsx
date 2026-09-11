import Link from "next/link"

import { geoAlbersUsa, geoPath } from "d3-geo"
import statesTopology from "us-atlas/states-10m.json"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"

type LicensureMapState = {
  abbreviation: string
  guideHref?: string
  name: string
}

type StateProperties = { name?: string }

const fipsToStateCode: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "12": "FL", "13": "GA", "15": "HI", "16": "ID",
  "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA",
  "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ",
  "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK",
  "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD", "47": "TN",
  "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY",
}

const topology = statesTopology as unknown as Topology<{ states: GeometryCollection<StateProperties> }>
const stateFeatures = feature(topology, topology.objects.states).features
const projection = geoAlbersUsa().translate([487.5, 305]).scale(1280)
const path = geoPath(projection)

export function UsLicensureMap({ states }: { states: readonly LicensureMapState[] }) {
  const stateByCode = new Map(states.map((state) => [state.abbreviation, state]))

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-border bg-white p-4 shadow-sm sm:p-6">
      <svg
        aria-label="Interactive map of U.S. healthcare licensure guides by state"
        className="min-w-[720px] text-slate-700"
        role="img"
        viewBox="0 0 975 610"
      >
        <title>Healthcare licensure guides by U.S. state</title>
        <desc>Select a state to open its healthcare licensure guide and official sources.</desc>
        {stateFeatures.map((state) => {
          const id = String(state.id).padStart(2, "0")
          const code = fipsToStateCode[id]
          if (!code) return null

          const guideState = stateByCode.get(code)
          const stateName = guideState?.name ?? state.properties?.name ?? code
          const statePath = path(state)

          return guideState?.guideHref ? (
            <Link aria-label={`Open the ${stateName} healthcare licensure guide`} href={guideState.guideHref} key={code}>
              <path
                className="cursor-pointer fill-teal-100 stroke-teal-700/40 transition-colors hover:fill-teal-600 focus:fill-teal-600"
                d={statePath ?? undefined}
                strokeWidth={1}
              >
                <title>{`Open ${stateName} licensure guide`}</title>
              </path>
            </Link>
          ) : (
            <path className="fill-slate-50 stroke-slate-300" d={statePath ?? undefined} key={code} strokeWidth={1}>
              <title>{`${stateName}: official sources in review`}</title>
            </path>
          )
        })}
      </svg>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">Every colored state opens a state-specific guide with official licensing resources. Requirements vary by profession and pathway.</p>
    </div>
  )
}
