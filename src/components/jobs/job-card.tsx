import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, CalendarDays, Clock3, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OrganizationTrustBadge } from "@/components/organizations/organization-trust-badge"
import { publicOrganizationLogoUrl } from "@/lib/employer/organization-logo"
import type { Job } from "@/lib/marketing-data"

type JobCardProps = {
  job: Job
  compact?: boolean
  layout?: "card" | "row"
}

export function JobCard({ job, compact = false, layout = "card" }: JobCardProps) {
  const logoUrl = publicOrganizationLogoUrl(job.organizationLogoPath)

  if (layout === "row") {
    return (
      <Card className="border-border/80 bg-card transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/8 text-primary">
            {logoUrl ? (
              <Image
                alt={`${job.employer} logo`}
                className="size-full bg-white object-contain p-1"
                height={48}
                src={logoUrl}
                width={48}
              />
            ) : (
              <Building2 className="size-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  job.isPlatformDemo
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : job.source === "live"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : undefined
                }
                variant="outline"
              >
                {job.isPlatformDemo
                  ? "Platform demonstration"
                  : job.source === "live"
                    ? "Live opportunity"
                    : "Product preview"}
              </Badge>
              {job.source === "live" && !job.isPlatformDemo && (
                <OrganizationTrustBadge
                  showNeutral={false}
                  verificationStatus={job.organizationVerificationStatus}
                />
              )}
              {job.visaSupport && (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  Visa support
                </Badge>
              )}
            </div>
            <p className="mt-3 text-xs font-bold tracking-[0.12em] text-primary uppercase">
              {job.specialty}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
              <Link
                className="transition-colors hover:text-primary"
                href={`/jobs/${job.slug}`}
              >
                {job.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.source === "live" && job.employerSlug ? (
                <Link
                  className="hover:text-primary hover:underline"
                  href={`/companies/${job.employerSlug}`}
                >
                  {job.employer}
                </Link>
              ) : (
                job.employer
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary" />{job.location}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-primary" />{job.type} · {job.setting}</span>
              {job.source === "live" && !job.isPlatformDemo && (
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" />{job.posted}</span>
              )}
              <span className="font-medium text-foreground">{job.salary}</span>
            </div>
          </div>

          <Button asChild className="h-10 min-w-32 rounded-xl" variant="outline">
            <Link href={`/jobs/${job.slug}`}>
              View role <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className={compact ? "p-5" : "p-6"}>
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/8 text-primary">
            {logoUrl ? (
              <Image
                alt={`${job.employer} logo`}
                className="size-full bg-white object-contain p-1"
                height={44}
                src={logoUrl}
                width={44}
              />
            ) : (
              <Building2 className="size-5" />
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge
              className={
                job.isPlatformDemo
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : job.source === "live"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : undefined
              }
              variant="outline"
            >
              {job.isPlatformDemo
                ? "Platform demonstration"
                : job.source === "live"
                  ? "Live opportunity"
                  : "Product preview"}
            </Badge>
            {job.source === "live" && !job.isPlatformDemo && (
              <OrganizationTrustBadge
                showNeutral={false}
                verificationStatus={job.organizationVerificationStatus}
              />
            )}
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
        <p className="mt-1 text-sm text-muted-foreground">
          {job.source === "live" && job.employerSlug ? (
            <Link
              className="hover:text-primary hover:underline"
              href={`/companies/${job.employerSlug}`}
            >
              {job.employer}
            </Link>
          ) : (
            job.employer
          )}
        </p>

        <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {job.location}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />
            {job.type} · {job.setting}
          </p>
          {job.source === "live" && !job.isPlatformDemo && (
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {job.posted}
            </p>
          )}
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
