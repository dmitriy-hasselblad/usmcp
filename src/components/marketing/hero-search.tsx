"use client"

import { MapPin, Search } from "lucide-react"
import { track } from "@vercel/analytics"

import { useCookieConsent } from "@/components/privacy/cookie-consent-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type HeroSearchProps = {
  query?: string
  location?: string
  compact?: boolean
  preservedFilters?: Record<string, string>
}

export function HeroSearch({
  query = "",
  location = "",
  compact = false,
  preservedFilters = {},
}: HeroSearchProps) {
  const { preferences } = useCookieConsent()

  return (
    <form
      action="/jobs"
      className={
        compact
          ? "rounded-2xl border border-border bg-card p-2 shadow-sm"
          : "rounded-[2rem] border border-slate-200 bg-white p-2.5 shadow-[0_18px_45px_rgba(15,76,129,0.13)]"
      }
      method="get"
      onSubmit={() => {
        if (preferences?.analytics) {
          track("job_search_submitted", { surface: compact ? "compact_search" : "homepage_hero" })
        }
      }}
      role="search"
    >
      {Object.entries(preservedFilters).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_auto]">
        <label className="group relative flex h-[4.4rem] items-center gap-3 rounded-2xl px-4 transition-colors focus-within:bg-muted/70">
          <span className="sr-only">Role, specialty, or employer</span>
          <Search className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 text-base shadow-none placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0"
            defaultValue={query}
            name="query"
            placeholder="Job title, specialty, or keyword"
            type="search"
          />
        </label>
        <label className="group relative flex h-[4.4rem] items-center gap-3 rounded-2xl px-4 transition-colors focus-within:bg-muted/70 md:border-l md:border-border">
          <span className="sr-only">City or state</span>
          <MapPin className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 text-base shadow-none placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0"
            defaultValue={location}
            name="location"
            placeholder="City, state, or ZIP"
            type="search"
          />
        </label>
        <Button className="h-[4.4rem] rounded-2xl bg-[#2376d8] px-6 text-base shadow-[0_10px_25px_rgba(15,76,129,0.22)] hover:bg-[#1c65ba]" type="submit">
          Search jobs
        </Button>
      </div>
    </form>
  )
}
