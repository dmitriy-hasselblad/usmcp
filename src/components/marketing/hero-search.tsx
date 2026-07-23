import { MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type HeroSearchProps = {
  query?: string
  location?: string
  compact?: boolean
}

export function HeroSearch({
  query = "",
  location = "",
  compact = false,
}: HeroSearchProps) {
  return (
    <form
      action="/jobs"
      className={
        compact
          ? "rounded-2xl border border-border bg-card p-2 shadow-sm"
          : "rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,76,129,0.16)] backdrop-blur"
      }
      method="get"
      role="search"
    >
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_auto]">
        <label className="group relative flex h-12 items-center gap-3 rounded-xl px-3 transition-colors focus-within:bg-muted/70">
          <span className="sr-only">Role, specialty, or employer</span>
          <Search className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            defaultValue={query}
            name="query"
            placeholder="Search role, specialty, or employer"
            type="search"
          />
        </label>
        <label className="group relative flex h-12 items-center gap-3 rounded-xl px-3 transition-colors focus-within:bg-muted/70 md:border-l md:border-border">
          <span className="sr-only">City or state</span>
          <MapPin className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            defaultValue={location}
            name="location"
            placeholder="City or state"
            type="search"
          />
        </label>
        <Button className="h-12 rounded-xl px-5 text-sm shadow-[0_10px_25px_rgba(15,76,129,0.22)]" type="submit">
          Search opportunities
        </Button>
      </div>
    </form>
  )
}
