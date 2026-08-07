import Link from "next/link"
import { Flag } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReportContentLink({
  returnTo,
  targetId,
  targetType,
}: {
  returnTo: string
  targetId: string
  targetType: "job" | "organization" | "organization_post"
}) {
  const params = new URLSearchParams({ targetType, targetId, returnTo })
  return <Button asChild size="sm" variant="ghost"><Link href={`/report?${params.toString()}`}><Flag/>Report content</Link></Button>
}
