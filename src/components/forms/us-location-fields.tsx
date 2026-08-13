"use client"

import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { usStates } from "@/lib/auth/validation"
import { usCitySuggestions } from "@/lib/us-geography"

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"

type UsLocationFieldsProps = {
  defaultCity?: string | null
  defaultStateCode?: string | null
  disabled?: boolean
  cityRequired?: boolean
}

export function UsLocationFields({
  defaultCity,
  defaultStateCode,
  disabled = false,
  cityRequired = false,
}: UsLocationFieldsProps) {
  const initialCity = defaultCity ?? ""
  const initialStateCode = defaultStateCode ?? ""
  const initialCities = usCitySuggestions[initialStateCode] ?? []
  const initialSuggestion = initialCities.includes(initialCity)
    ? initialCity
    : initialCity
      ? "other"
      : ""
  const [stateCode, setStateCode] = useState(initialStateCode)
  const [cityChoice, setCityChoice] = useState(initialSuggestion)
  const [otherCity, setOtherCity] = useState(initialSuggestion === "other" ? initialCity : "")
  const cities = useMemo(() => usCitySuggestions[stateCode] ?? [], [stateCode])
  const showOther = cityChoice === "other"

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">
        Primary U.S. state
        <select
          autoComplete="address-level1"
          className={selectClassName}
          disabled={disabled}
          name="stateCode"
          onChange={(event) => {
            setStateCode(event.target.value)
            setCityChoice("")
            setOtherCity("")
          }}
          required
          value={stateCode}
        >
          <option value="">Select a state</option>
          {usStates.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        City {cityRequired ? null : <span className="font-normal text-muted-foreground">Optional</span>}
        {showOther ? (
          <Input
            autoComplete="address-level2"
            className="h-11"
            disabled={disabled}
            maxLength={120}
            minLength={2}
            name="city"
            onChange={(event) => setOtherCity(event.target.value)}
            placeholder="Enter any U.S. city"
            required={cityRequired}
            value={otherCity}
          />
        ) : (
          <>
            <select
              aria-label="Suggested city"
              className={selectClassName}
              disabled={disabled || !stateCode}
              onChange={(event) => setCityChoice(event.target.value)}
              required={cityRequired}
              value={cityChoice}
            >
              <option value="">Select a suggested city</option>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              <option value="other">Other U.S. city</option>
            </select>
            <input name="city" type="hidden" value={cityChoice} />
          </>
        )}
        <span className="text-xs font-normal text-muted-foreground">Choose a suggested city or enter any other U.S. city.</span>
      </label>
    </div>
  )
}
