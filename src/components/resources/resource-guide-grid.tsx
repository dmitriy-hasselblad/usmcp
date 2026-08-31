"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, BookOpenText } from "lucide-react"

import type { ResourceGuide } from "@/lib/resources/content"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ResourceGuideGrid({ resources }: { resources: ResourceGuide[] }) {
  const filters = ["All topics", ...new Set(resources.map((resource) => resource.category))]
  const [activeFilter, setActiveFilter] = useState("All topics")

  const visibleResources = useMemo(
    () =>
      activeFilter === "All topics"
        ? resources
        : resources.filter((resource) => resource.category === activeFilter),
    [activeFilter, resources],
  )

  return (
    <div>
      <div aria-label="Filter career resources" className="mb-8 flex flex-wrap gap-2" role="group">
        {filters.map((filter) => {
          const active = filter === activeFilter
          return (
            <button
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground hover:border-primary/40 hover:text-primary"
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {visibleResources.map((resource) => (
          <article id={resource.slug} key={resource.slug}>
            <Card className="h-full scroll-mt-28 overflow-hidden border-border/80 bg-white">
              <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#f7fbff_0%,#eefaf7_60%,#edf5ff_100%)]">
                {resource.image && <><Image
                  alt={resource.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  src={resource.image.src}
                /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-white/5" /></>}
                <span className="absolute left-6 top-6 grid size-11 place-items-center rounded-xl border border-white/80 bg-white/90 text-primary shadow-sm">
                  <BookOpenText className="size-5" />
                </span>
              </div>
              <CardContent className="p-6">
                <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
                  {resource.category}
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em]">
                  {resource.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {resource.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm text-muted-foreground">{resource.readTime}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/resources/${resource.slug}`}>
                      Read guide <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </article>
        ))}
      </div>
    </div>
  )
}
