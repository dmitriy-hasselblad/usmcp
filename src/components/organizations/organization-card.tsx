import Link from "next/link"
import { ArrowRight, Building2, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PublicOrganization } from "@/lib/organizations/public-organizations"

type OrganizationCardProps = {
  organization: PublicOrganization
  compact?: boolean
}

export function OrganizationCard({
  organization,
  compact = false,
}: OrganizationCardProps) {
  const jobCount = organization.jobs.filter((job) => !job.isPlatformDemo).length
  const isVerified =
    !organization.isPlatformProfile &&
    organization.verificationStatus === "verified"

  return (
    <Card className="h-full border-border/80 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className={compact ? "p-5" : "p-6 sm:p-7"}>
        <div className="flex items-start justify-between gap-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/8 text-sm font-bold text-primary">
            {getInitials(organization.name)}
          </span>
          <Badge
            className={
              organization.isPlatformProfile
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : isVerified
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : undefined
            }
            variant="outline"
          >
            {organization.isPlatformProfile
              ? "Platform demonstration"
              : isVerified
              ? "Verified organization"
              : "Organization profile"}
          </Badge>
        </div>

        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
          <Link
            className="transition-colors hover:text-primary"
            href={`/companies/${organization.slug}`}
          >
            {organization.name}
          </Link>
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            {organization.type}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" />
            {organization.location}
          </span>
        </div>
        {!compact && (
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {organization.description ||
              "Explore this healthcare organization's currently published opportunities."}
          </p>
        )}
        <Button asChild className="mt-6 rounded-xl" variant="outline">
          <Link href={`/companies/${organization.slug}`}>
            {organization.isPlatformProfile
              ? "View platform demonstrations"
              : `View ${jobCount} open ${jobCount === 1 ? "role" : "roles"}`}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
