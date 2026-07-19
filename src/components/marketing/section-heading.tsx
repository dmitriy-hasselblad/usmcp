import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
  tone?: "default" | "inverted"
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("text-xs font-bold tracking-[0.16em] uppercase", tone === "inverted" ? "text-teal-100" : "text-primary")}>
        {eyebrow}
      </p>
      <h2 className={cn("mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl", tone === "inverted" ? "text-white" : "text-foreground")}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-7", tone === "inverted" ? "text-blue-100/80" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  )
}
