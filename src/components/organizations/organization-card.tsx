import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, MapPin } from "lucide-react"

import { OrganizationTrustBadge } from "@/components/organizations/organization-trust-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { publicOrganizationLogoUrl } from "@/lib/employer/organization-logo"
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
  const logoUrl = publicOrganizationLogoUrl(organization.logoPath)

  return (
    <Card className="h-full border-border/80 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className={compact ? "p-5" : "p-6 sm:p-7"}>
        <div className="flex items-start justify-between gap-5">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/8 text-primary">
            {logoUrl ? (
              <Image
                alt={`${organization.name} logo`}
                className="size-full bg-white object-contain p-1"
                height={48}
                src={logoUrl}
                width={48}
              />
            ) : (
              <Building2 className="size-5" />
            )}
          </span>
          <OrganizationTrustBadge
            isPlatformDemo={organization.isPlatformProfile}
            verificationStatus={organization.verificationStatus}
          />
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
