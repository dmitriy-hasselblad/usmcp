import { cn } from "@/lib/utils"

type UsmcpLogoProps = {
  className?: string
  compact?: boolean
}

export function UsmcpLogo({ className, compact = false }: UsmcpLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-primary shadow-[0_8px_20px_rgba(15,76,129,0.22)]">
        <span className="absolute h-5 w-1.5 rounded-full bg-white" />
        <span className="absolute h-1.5 w-5 rounded-full bg-white" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-base font-bold tracking-[-0.04em] text-foreground">
            USMCP
          </span>
          <span className="mt-1 block text-[9px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Medical Careers
          </span>
        </span>
      )}
    </span>
  )
}
