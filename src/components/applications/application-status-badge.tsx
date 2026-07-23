import { Badge } from "@/components/ui/badge"
import type { ApplicationStatus } from "@/lib/applications/constants"
import { cn } from "@/lib/utils"

const labels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  reviewing: "In review",
  interview: "Interview",
  offer: "Offer",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
}

const tones: Record<ApplicationStatus, string> = {
  submitted: "border-blue-200 bg-blue-50 text-blue-800",
  reviewing: "border-amber-200 bg-amber-50 text-amber-800",
  interview: "border-violet-200 bg-violet-50 text-violet-800",
  offer: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-slate-200 bg-slate-100 text-slate-700",
  withdrawn: "border-slate-200 bg-white text-slate-600",
}

export function ApplicationStatusBadge({
  className,
  status,
}: {
  className?: string
  status: ApplicationStatus
}) {
  return (
    <Badge className={cn(tones[status], className)} variant="outline">
      {labels[status]}
    </Badge>
  )
}
