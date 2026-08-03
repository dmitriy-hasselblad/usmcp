import Link from "next/link"

import { Button } from "@/components/ui/button"

export function AdminDirectoryPagination({
  basePath,
  page,
  pageSize,
  query,
  total,
}: {
  basePath: string
  page: number
  pageSize: number
  query?: string
  total: number
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (totalPages === 1) return null

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button disabled size="sm" variant="outline">Previous</Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={pageHref(basePath, page - 1, query)}>Previous</Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button disabled size="sm" variant="outline">Next</Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={pageHref(basePath, page + 1, query)}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function pageHref(basePath: string, page: number, query?: string) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  params.set("page", String(Math.max(1, page)))
  return `${basePath}?${params.toString()}`
}
