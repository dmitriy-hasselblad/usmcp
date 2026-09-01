export type LicensureState = {
  name: string
  abbreviation: string
  slug: string
  guideHref?: string
}

const stateNames = [
  ["Alabama", "AL"], ["Alaska", "AK"], ["Arizona", "AZ"], ["Arkansas", "AR"],
  ["California", "CA"], ["Colorado", "CO"], ["Connecticut", "CT"], ["Delaware", "DE"],
  ["Florida", "FL"], ["Georgia", "GA"], ["Hawaii", "HI"], ["Idaho", "ID"],
  ["Illinois", "IL"], ["Indiana", "IN"], ["Iowa", "IA"], ["Kansas", "KS"],
  ["Kentucky", "KY"], ["Louisiana", "LA"], ["Maine", "ME"], ["Maryland", "MD"],
  ["Massachusetts", "MA"], ["Michigan", "MI"], ["Minnesota", "MN"], ["Mississippi", "MS"],
  ["Missouri", "MO"], ["Montana", "MT"], ["Nebraska", "NE"], ["Nevada", "NV"],
  ["New Hampshire", "NH"], ["New Jersey", "NJ"], ["New Mexico", "NM"], ["New York", "NY"],
  ["North Carolina", "NC"], ["North Dakota", "ND"], ["Ohio", "OH"], ["Oklahoma", "OK"],
  ["Oregon", "OR"], ["Pennsylvania", "PA"], ["Rhode Island", "RI"], ["South Carolina", "SC"],
  ["South Dakota", "SD"], ["Tennessee", "TN"], ["Texas", "TX"], ["Utah", "UT"],
  ["Vermont", "VT"], ["Virginia", "VA"], ["Washington", "WA"], ["West Virginia", "WV"],
  ["Wisconsin", "WI"], ["Wyoming", "WY"],
] as const

export const licensureStates: LicensureState[] = stateNames.map(([name, abbreviation]) => ({
  name,
  abbreviation,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  guideHref: ({
    FL: "/resources/florida-healthcare-licensure-research-checklist",
    TX: "/resources/texas-healthcare-licensure-research-checklist",
    CA: "/resources/california-healthcare-licensure-research-checklist",
    NY: "/resources/new-york-healthcare-licensure-research-checklist",
    PA: "/resources/pennsylvania-healthcare-licensure-research-checklist",
    IL: "/resources/illinois-healthcare-licensure-research-checklist",
    OH: "/resources/ohio-healthcare-licensure-research-checklist",
    GA: "/resources/georgia-healthcare-licensure-research-checklist",
    NC: "/resources/north-carolina-healthcare-licensure-research-checklist",
    NJ: "/resources/new-jersey-healthcare-licensure-research-checklist",
    MA: "/resources/massachusetts-healthcare-licensure-research-checklist",
    WA: "/resources/washington-healthcare-licensure-research-checklist",
    MI: "/resources/michigan-healthcare-licensure-research-checklist",
    VA: "/resources/virginia-healthcare-licensure-research-checklist",
  } as Record<string, string | undefined>)[abbreviation],
}))
