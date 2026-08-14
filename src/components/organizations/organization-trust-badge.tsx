import Link from "next/link"

import { Badge } from "@/components/ui/badge"

type OrganizationTrustBadgeProps = {
  isPlatformDemo?: boolean
  showNeutral?: boolean
  verificationStatus?: string | null
}

export function OrganizationTrustBadge({
  isPlatformDemo = false,
  showNeutral = true,
  verificationStatus,
}: OrganizationTrustBadgeProps) {
  if (isPlatformDemo) {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-900" variant="outline">
        Platform demonstration
      </Badge>
    )
  }

  if (verificationStatus === "verified") {
    return (
      <Badge
        asChild
        className="border-emerald-200 bg-emerald-50 text-emerald-800"
        variant="outline"
      >
        <Link href="/verification" title="Learn what verified organization means">
          Verified organization
        </Link>
      </Badge>
    )
  }

  return showNeutral ? <Badge variant="outline">Organization profile</Badge> : null
}
