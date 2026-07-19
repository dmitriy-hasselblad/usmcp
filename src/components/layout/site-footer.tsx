import Link from "next/link"

import { UsmcpLogo } from "@/components/brand/usmcp-logo"

const footerLinks = [
  "About USMCP",
  "For professionals",
  "For employers",
  "Career resources",
  "Privacy",
  "Terms",
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <UsmcpLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            A more thoughtful way for healthcare professionals and organizations to move forward.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {footerLinks.map((link) => (
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="#top" key={link}>
              {link}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} USMCP. All rights reserved.</span>
          <span>U.S. Medical Career Portal</span>
        </div>
      </div>
    </footer>
  )
}
