import Link from "next/link"

import { SmviaLogo } from "@/components/brand/smvia-logo"
import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button"

const footerGroups = [
  {
    title: "For healthcare professionals",
    links: [
      { href: "/resources", label: "Explore careers" },
      { href: "/resources/licensure", label: "Licensure by state" },
      { href: "/salary", label: "Salary hub" },
      { href: "/jobs", label: "Find opportunities" },
    ],
  },
  {
    title: "For employers",
    links: [
      { href: "/for-employers", label: "Employer tools" },
      { href: "/sign-up", label: "Create an employer account" },
      { href: "/companies", label: "Organization profiles" },
      { href: "/resources/how-to-publish-a-trustworthy-healthcare-job", label: "Hiring guidance" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/news#smvia-career-guides", label: "Career guides" },
      { href: "/news", label: "News & insights" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "SM VIA",
    links: [
      { href: "/#why-smvia", label: "About SM VIA" },
      { href: "/verification", label: "Verification" },
      { href: "/for-associations", label: "For associations" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#0c2945] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-7 border-b border-white/15 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SmviaLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/75">
              Career intelligence, practical guidance, and opportunities for U.S.
              healthcare professionals and organizations.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-teal-200 uppercase">Follow SM VIA</p>
            <div className="mt-3 flex items-center gap-2">
              <SocialLink href="https://www.linkedin.com/company/smvia/" label="Follow SM VIA on LinkedIn">
                <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24"><path d="M6.27 8.15H3.16V21h3.11V8.15ZM4.71 3C3.72 3 3 3.71 3 4.65c0 .92.71 1.65 1.68 1.65h.02c1 0 1.7-.73 1.7-1.65C6.38 3.71 5.7 3 4.71 3ZM21 13.63c0-3.62-1.94-5.31-4.53-5.31-2.09 0-3.03 1.15-3.55 1.96V8.15H9.81c.04 1.41 0 12.85 0 12.85h3.11v-7.18c0-.38.03-.76.14-1.03.22-.77.74-1.57 1.61-1.57 1.14 0 1.59.87 1.59 2.14V21h3.1v-7.37c0-3.95-2.1-5.79-4.89-5.79Z" fill="currentColor" /></svg>
              </SocialLink>
              <SocialLink href="https://x.com/smvia_org" label="Follow SM VIA on X">
                <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24"><path d="M18.9 2.25h3.68l-8.04 9.19L24 21.75h-7.41l-5.8-7.58-6.63 7.58H.47l8.6-9.83L0 2.25h7.6l5.24 6.93 6.06-6.93Zm-1.3 17.27h2.04L6.49 4.37H4.3L17.6 19.52Z" fill="currentColor" /></svg>
              </SocialLink>
              <SocialLink href="https://instagram.com/smvia.careers/" label="Follow SM VIA on Instagram">
                <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24"><rect height="15" rx="4" stroke="currentColor" strokeWidth="2" width="15" x="4.5" y="4.5" /><circle cx="12" cy="12" fill="none" r="3.5" stroke="currentColor" strokeWidth="2" /><circle cx="16.8" cy="7.3" fill="currentColor" r="1.1" /></svg>
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-9 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-white">{group.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link className="text-blue-100/75 transition hover:text-teal-200" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-white/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-blue-100/65">
            <span>© {new Date().getFullYear()} SM VIA. All rights reserved.</span>
            <Link className="hover:text-white" href="/cookies">Cookie notice</Link>
            <PrivacyChoicesButton />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a aria-label="Featured on Maidensail" className="inline-flex rounded-md bg-white px-2 py-1.5 opacity-85 transition hover:opacity-100" href="https://maidensail.com/startup/sm-via" rel="dofollow">
              <img alt="Featured on Maidensail" height={28} src="https://maidensail.com/badge/sm-via.svg" />
            </a>
            <a aria-label="Launched on StartupBase" className="inline-flex rounded-md bg-white px-2 py-1 opacity-85 transition hover:opacity-100" href="https://startupbase.io/products/sm-via-is-a-u-s-healthcare-platform?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light" rel="noopener noreferrer" target="_blank">
              <img alt="Launched on StartupBase" height={31} src="https://statics.startupbase.io/site/badges/launched-on-sb.svg" style={{ height: 31, width: "auto" }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ children, href, label }: { children: React.ReactNode; href: string; label: string }) {
  return (
    <a aria-label={label} className="grid size-9 place-items-center rounded-lg border border-white/20 text-white transition hover:border-teal-200 hover:bg-teal-200 hover:text-primary" href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  )
}
