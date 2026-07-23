import { SiteHeader } from "@/components/layout/site-header"
import { Card, CardContent } from "@/components/ui/card"

export default function JobsLoading() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card className="border-border/80" key={index}>
              <CardContent className="space-y-4 p-6">
                <div className="size-11 animate-pulse rounded-xl bg-muted" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
