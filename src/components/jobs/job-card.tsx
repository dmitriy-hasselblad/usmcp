import Link from "next/link"
import { ArrowRight, Building2, Clock3, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Job } from "@/lib/marketing-data"

type JobCardProps = {
  job: Job
  compact?: boolean
}

export function JobCard({ job, compact = false }: JobCardProps) {
  return (
    <Card className="h-full border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className={compact ? "p-5" : "p-6"}>
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge
              className={
                job.source === "live"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : undefined
              }
              variant="outline"
            >
              {job.source === "live" ? "Live opportunity" : "Product preview"}
            </Badge>
            {job.visaSupport && (
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Visa support
              </Badge>
            )}
          </div>
        </div>

        <p className="mt-5 text-xs font-bold tracking-[0.12em] text-primary uppercase">
          {job.specialty}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
          <Link
            className="transition-colors hover:text-primary"
            href={`/jobs/${job.slug}`}
          >
            {job.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{job.employer}</p>

        <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {job.location}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />
            {job.type} · {job.setting}
          </p>
          <p className="font-medium text-foreground">{job.salary}</p>
        </div>

        {!compact && (
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {job.summary}
          </p>
        )}

        <Button asChild className="mt-6 h-10 w-full rounded-xl" variant="outline">
          <Link href={`/jobs/${job.slug}`}>
            View role <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
