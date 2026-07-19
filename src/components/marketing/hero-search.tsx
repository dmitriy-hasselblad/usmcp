import { MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSearch() {
  return (
    <form action="#featured-jobs" className="rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,76,129,0.16)] backdrop-blur">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_auto]">
        <label className="group relative flex h-12 items-center gap-3 rounded-xl px-3 transition-colors focus-within:bg-muted/70">
          <Search className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            name="query"
            placeholder="Search role, specialty, or employer"
            type="search"
          />
        </label>
        <label className="group relative flex h-12 items-center gap-3 rounded-xl px-3 transition-colors focus-within:bg-muted/70 md:border-l md:border-border">
          <MapPin className="size-5 text-primary" />
          <Input
            className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
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
