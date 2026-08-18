import Image from "next/image"

import { cn } from "@/lib/utils"

type SmviaLogoProps = {
  className?: string
  compact?: boolean
}

export function SmviaLogo({ className, compact = false }: SmviaLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <Image
          alt="SM VIA"
          className="scale-[1.55] object-contain"
          fill
          priority
          sizes="64px"
          src="/images/brand/smvia-logo.png"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-base font-bold tracking-[-0.04em] text-foreground">
            SM VIA
          </span>
          <span className="mt-1 block text-[9px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Your path. Our purpose.
          </span>
        </span>
      )}
    </span>
  )
}
