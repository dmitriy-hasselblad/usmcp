import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputPath = path.join(root, "src", "lib", "salary", "bls-oews-may-2025.json")
const endpoint = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

const states = [
  ["FL", "Florida", "1200000"], ["TX", "Texas", "4800000"], ["CA", "California", "0600000"],
  ["NY", "New York", "3600000"], ["PA", "Pennsylvania", "4200000"], ["IL", "Illinois", "1700000"],
  ["OH", "Ohio", "3900000"], ["GA", "Georgia", "1300000"], ["NC", "North Carolina", "3700000"],
  ["NJ", "New Jersey", "3400000"], ["MA", "Massachusetts", "2500000"], ["WA", "Washington", "5300000"],
  ["MI", "Michigan", "2600000"], ["VA", "Virginia", "5100000"], ["CO", "Colorado", "0800000"],
  ["IN", "Indiana", "1800000"], ["TN", "Tennessee", "4700000"], ["CT", "Connecticut", "0900000"],
  ["WI", "Wisconsin", "5500000"], ["UT", "Utah", "4900000"],
].map(([code, name, area]) => ({ code, name, area }))

const occupations = [
  ["registered-nurse", "Registered Nurse", "291141"],
  ["nurse-practitioner", "Nurse Practitioner", "291171"],
  ["physician-assistant", "Physician Assistant", "291071"],
  ["licensed-practical-nurse", "Licensed Practical Nurse", "292061"],
  ["medical-assistant", "Medical Assistant", "319092"],
  ["nursing-assistant", "Nursing Assistant", "311131"],
  ["dental-hygienist", "Dental Hygienist", "291292"],
  ["physical-therapist", "Physical Therapist", "291123"],
  ["occupational-therapist", "Occupational Therapist", "291122"],
  ["speech-language-pathologist", "Speech-Language Pathologist", "291127"],
  ["pharmacist", "Pharmacist", "291051"],
  ["radiologic-technologist", "Radiologic Technologist", "291124"],
  ["diagnostic-medical-sonographer", "Diagnostic Medical Sonographer", "292032"],
  ["respiratory-therapist", "Respiratory Therapist", "291126"],
  ["clinical-laboratory-technologist", "Clinical Laboratory Technologist", "292010"],
  ["emergency-medical-technician", "Emergency Medical Technician", "292042"],
  ["surgical-technologist", "Surgical Technologist", "292055"],
  ["medical-health-services-manager", "Medical and Health Services Manager", "119111"],
  ["health-information-technologist", "Health Information Technologist", "151211"],
  ["medical-scientist", "Medical Scientist", "191042"],
].map(([slug, name, soc]) => ({ slug, name, soc }))

const nationalMeasures = [
  ["mean", "04"], ["p10", "11"], ["p25", "12"], ["median", "13"], ["p75", "14"], ["p90", "15"],
]

function seriesId(areaType, area, occupation, dataType) {
  return `OEU${areaType}${area}000000${occupation}${dataType}`
}

async function request(seriesIds) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seriesid: seriesIds, startyear: "2025", endyear: "2025" }),
  })

  if (!response.ok) throw new Error(`BLS API responded with ${response.status}`)
  const body = await response.json()
  if (body.status !== "REQUEST_SUCCEEDED") throw new Error(`BLS API request failed: ${body.message?.join("; ")}`)

  return new Map(body.Results.series.map((series) => [series.seriesID, Number(series.data?.[0]?.value) || null]))
}

async function fetchAll(seriesIds) {
  const values = new Map()
  for (let index = 0; index < seriesIds.length; index += 25) {
    const batch = seriesIds.slice(index, index + 25)
    const batchValues = await request(batch)
    batchValues.forEach((value, key) => values.set(key, value))
    if (index + 25 < seriesIds.length) await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return values
}

const nationalIds = occupations.flatMap((occupation) => nationalMeasures.map(([, type]) => seriesId("N", "0000000", occupation.soc, type)))
const stateMedianIds = states.flatMap((state) => occupations.map((occupation) => seriesId("S", state.area, occupation.soc, "13")))
const values = await fetchAll([...nationalIds, ...stateMedianIds])

const data = {
  sourceName: "U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS)",
  sourceUrl: "https://www.bls.gov/oes/2025/may/oessrcst.htm",
  release: "May 2025",
  retrievedAt: new Date().toISOString().slice(0, 10),
  states: states.map(({ code, name }) => ({ code, name })),
  occupations: occupations.map((occupation) => ({
    slug: occupation.slug,
    name: occupation.name,
    soc: occupation.soc,
    national: Object.fromEntries(nationalMeasures.map(([key, type]) => [key, values.get(seriesId("N", "0000000", occupation.soc, type)) ?? null])),
    stateMedianAnnual: Object.fromEntries(states.map((state) => [state.code, values.get(seriesId("S", state.area, occupation.soc, "13")) ?? null])),
  })),
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`)
console.log(`Wrote ${data.occupations.length} occupations across ${data.states.length} states to ${outputPath}`)
