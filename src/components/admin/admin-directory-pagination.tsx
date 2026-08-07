import Link from "next/link"

import { Button } from "@/components/ui/button"

export function AdminDirectoryPagination({
  basePath,
  page,
  pageSize,
  params,
  query,
  status,
  total,
}: {
  basePath: string
  page: number
  pageSize: number
  params?: Record<string, string | undefined>
  query?: string
  status?: string
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
            <Link href={pageHref(basePath, page - 1, query, status, params)}>Previous</Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button disabled size="sm" variant="outline">Next</Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={pageHref(basePath, page + 1, query, status, params)}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function pageHref(
  basePath: string,
  page: number,
  query?: string,
  status?: string,
  extraParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (status) params.set("status", status)
  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  params.set("page", String(Math.max(1, page)))
  return `${basePath}?${params.toString()}`
}
