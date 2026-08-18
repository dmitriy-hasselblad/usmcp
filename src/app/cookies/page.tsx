import type { Metadata } from "next"

import { LegalPageShell } from "@/components/privacy/legal-page-shell"
import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button"

export const metadata: Metadata = {
  title: "Cookie Notice",
  description:
    "Learn how SM VIA uses essential and optional cookies and manage your privacy choices.",
}

export default function CookieNoticePage() {
  return (
    <LegalPageShell
      description="This notice explains how SM VIA uses cookies and similar technologies, which services are currently active, and how you can control optional uses."
      lastUpdated="August 8, 2026"
      title="Cookie Notice"
    >
      <section>
        <h2>1. What cookies are</h2>
        <p>
          Cookies are small text files stored by your browser. They can keep a
          session secure, remember a choice, measure how a site performs, or
          support advertising. Similar technologies may include local storage,
          pixels, and software development kits.
        </p>
      </section>

      <section>
        <h2>2. How SM VIA uses cookies</h2>
        <p>
          SM VIA uses essential cookies for security, authentication, account
          sessions, and privacy preferences. Optional cookies are not required
          to browse the public site or use core account features.
        </p>
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid gap-2 border-b border-border bg-muted/45 p-4 sm:grid-cols-[11rem_1fr]">
            <strong>Essential</strong>
            <span>
              Always active. Supports secure sign-in, Supabase sessions, fraud
              prevention, and your saved cookie choices.
            </span>
          </div>
          <div className="grid gap-2 border-b border-border p-4 sm:grid-cols-[11rem_1fr]">
            <strong>Functional</strong>
            <span>
              Optional. May remember enhanced interface or personalization
              choices.
            </span>
          </div>
          <div className="grid gap-2 border-b border-border bg-muted/45 p-4 sm:grid-cols-[11rem_1fr]">
            <strong>Analytics</strong>
            <span>
              Optional. When you allow this category, SM VIA uses Vercel Web
              Analytics to understand site usage, traffic sources, and page
              performance. It is not used for advertising or cross-context
              behavioral tracking.
            </span>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-[11rem_1fr]">
            <strong>Advertising</strong>
            <span>
              Optional. Could support targeted advertising or cross-context
              behavioral advertising. SM VIA does not currently use advertising
              cookies.
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2>3. Cookies currently used</h2>
        <ul>
          <li>
            <strong>Supabase authentication cookies</strong> (names beginning
            with <code>sb-</code>) keep registered users securely signed in.
            Their duration depends on the account session and token refresh
            process.
          </li>
          <li>
            <strong>ushce_cookie_consent</strong> stores your category choices,
            the consent version, and the time of your decision for up to 180
            days.
          </li>
        </ul>
        <p>
          Hosting and security providers may process limited technical
          information needed to deliver and protect the site. Vercel Web
          Analytics starts only after you choose the Analytics category. If
          SM VIA adds another optional provider, this notice and the consent
          version will be updated before activation.
        </p>
      </section>

      <section>
        <h2>4. Managing your choices</h2>
        <p>
          You can accept all optional categories, reject non-essential
          categories, or make a category-by-category choice. You can change
          your decision at any time:
        </p>
        <PrivacyChoicesButton className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted" />
        <p>
          You may also remove cookies through your browser. Removing the SM VIA
          preference cookie will cause the privacy choices banner to appear
          again on a future visit.
        </p>
      </section>

      <section>
        <h2>5. Global Privacy Control</h2>
        <p>
          When a supported browser sends a Global Privacy Control signal, SM VIA
          treats it as a request to keep advertising, sale, and sharing for
          cross-context behavioral advertising disabled. Other optional
          categories remain subject to your displayed choices.
        </p>
      </section>

      <section>
        <h2>6. Changes to this notice</h2>
        <p>
          We may update this notice as the platform and applicable privacy
          requirements develop. Material changes to optional tracking will
          require a new choice where appropriate.
        </p>
      </section>
    </LegalPageShell>
  )
}
