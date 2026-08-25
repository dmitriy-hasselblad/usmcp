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
  { href: "/contact", label: "Contact" },
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
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-foreground">
            SM VIA - Specialized Medical Vocations &amp; Industry Alliance.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            A more thoughtful way for healthcare professionals and organizations
            to move forward.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              aria-label="Follow SM VIA on LinkedIn"
              className="grid size-10 place-items-center rounded-xl border border-border text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
              href="https://www.linkedin.com/company/smvia/"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
                <path
                  d="M6.27 8.15H3.16V21h3.11V8.15ZM4.71 3C3.72 3 3 3.71 3 4.65c0 .92.71 1.65 1.68 1.65h.02c1 0 1.7-.73 1.7-1.65C6.38 3.71 5.7 3 4.71 3ZM21 13.63c0-3.62-1.94-5.31-4.53-5.31-2.09 0-3.03 1.15-3.55 1.96V8.15H9.81c.04 1.41 0 12.85 0 12.85h3.11v-7.18c0-.38.03-.76.14-1.03.22-.77.74-1.57 1.61-1.57 1.14 0 1.59.87 1.59 2.14V21h3.1v-7.37c0-3.95-2.1-5.79-4.89-5.79Z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a
              aria-label="Follow SM VIA on X"
              className="grid size-10 place-items-center rounded-xl border border-border text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
              href="https://x.com/smvia_org"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
                <path
                  d="M18.9 2.25h3.68l-8.04 9.19L24 21.75h-7.41l-5.8-7.58-6.63 7.58H.47l8.6-9.83L0 2.25h7.6l5.24 6.93 6.06-6.93Zm-1.3 17.27h2.04L6.49 4.37H4.3L17.6 19.52Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
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
          <span>Specialized Medical Vocations &amp; Industry Alliance</span>
        </div>
      </div>
    </footer>
  )
}
