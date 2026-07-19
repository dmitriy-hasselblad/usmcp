export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <span className="size-4 animate-pulse rounded-full bg-primary" />
        Loading USMCP
      </div>
    </div>
  )
}
