import type { ReactNode } from "react"

export function EmployerPageHeader({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode
  description: string
  eyebrow?: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
