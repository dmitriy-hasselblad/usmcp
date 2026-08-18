import Link from "next/link"

import { SmviaLogo } from "@/components/brand/smvia-logo"
import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button"

const footerLinks = [
  { href: "/#why-smvia", label: "About SM VIA" },
  { href: "/jobs", label: "Find jobs" },
  { href: "/companies", label: "Organizations" },
  { href: "/verification", label: "Verification" },
  { href: "/news", label: "News & insights" },
  { href: "/for-employers", label: "For employers" },
  { href: "/resources", label: "Career resources" },
  { href: "/sign-up", label: "Create an account" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Notice" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <SmviaLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            A more thoughtful way for healthcare professionals and organizations
            to move forward.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {footerLinks.map((link) => (
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
          <PrivacyChoicesButton />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} SM VIA. All rights reserved.</span>
          <span>The U.S. Healthcare Career Ecosystem</span>
        </div>
      </div>
    </footer>
  )
}
