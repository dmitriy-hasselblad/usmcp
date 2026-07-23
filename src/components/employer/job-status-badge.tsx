import { Badge } from "@/components/ui/badge"
import type { JobStatus } from "@/lib/employer/constants"
import { cn } from "@/lib/utils"

const statusStyles: Record<JobStatus, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  paused: "border-blue-200 bg-blue-50 text-blue-800",
  closed: "border-slate-200 bg-slate-100 text-slate-700",
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge
      className={cn("capitalize", statusStyles[status])}
      variant="outline"
    >
      {status}
    </Badge>
  )
}
