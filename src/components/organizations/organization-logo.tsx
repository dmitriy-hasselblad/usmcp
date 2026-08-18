import Image from "next/image"

type OrganizationLogoProps = {
  name: string
  className?: string
}

export function OrganizationLogo({ name, className }: OrganizationLogoProps) {
  if (!hasOrganizationLogo(name)) {
    return null
  }

  return (
    <div
      className={
        className ??
        "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-white p-1"
      }
    >
      <Image
        alt="SMVIA logo"
        className="h-full w-full object-contain"
        fill
        sizes="64px"
        src="/images/organizations/smvia-logo.png"
      />
    </div>
  )
}

export function hasOrganizationLogo(name: string) {
  return name.trim().toLowerCase().startsWith("smvia")
}
