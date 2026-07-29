import type { Metadata } from "next"
import Link from "next/link"

import { LegalPageShell } from "@/components/privacy/legal-page-shell"
import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how USHCE collects, uses, protects, and provides choices for personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      description="This policy describes the personal information USHCE handles while building a secure career and hiring ecosystem for U.S. healthcare."
      lastUpdated="July 29, 2026"
      title="Privacy Policy"
    >
      <aside className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-6">
        USHCE is currently a development-stage platform. This policy describes
        the present product and its intended privacy controls. A verified
        privacy contact, legal entity details, and formal request channel will
        be published before commercial launch.
      </aside>

      <section>
        <h2>1. Information we collect</h2>
        <p>Depending on how you use USHCE, we may collect:</p>
        <ul>
          <li>
            account information, such as your name, email address, account type,
            and authentication records;
          </li>
          <li>
            professional profile information, including career history,
            education, credentials, skills, locations, and job preferences;
          </li>
          <li>
            organization information, recruiter details, job postings, and
            hiring activity;
          </li>
          <li>
            applications, messages, documents, and other information you choose
            to submit;
          </li>
          <li>
            technical and security information, such as IP address, browser
            type, device information, timestamps, and security logs; and
          </li>
          <li>
            cookie preferences and optional usage information when permitted.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How we use information</h2>
        <p>We use information to:</p>
        <ul>
          <li>create and secure accounts;</li>
          <li>provide professional, employer, job, and application features;</li>
          <li>connect candidates and organizations at their direction;</li>
          <li>operate, troubleshoot, and improve the platform;</li>
          <li>prevent abuse, fraud, and security incidents;</li>
          <li>communicate about accounts, applications, and service changes;</li>
          <li>comply with legal obligations and enforce platform terms; and</li>
          <li>
            perform optional analytics or personalization only when the
            applicable permission is available.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. When information is disclosed</h2>
        <p>Information may be disclosed:</p>
        <ul>
          <li>
            to candidates, employers, or recruiters when you use a feature that
            is designed to share it;
          </li>
          <li>
            to service providers that host, secure, authenticate, or support the
            platform, including Supabase and Vercel;
          </li>
          <li>
            when required by law or reasonably necessary to protect users,
            USHCE, or the public; and
          </li>
          <li>as part of a merger, financing, or business transfer.</li>
        </ul>
        <p>
          USHCE does not currently sell personal information or share it for
          cross-context behavioral advertising. If that practice changes, we
          will update this policy and provide the legally required notice and
          opt-out controls before the change takes effect.
        </p>
      </section>

      <section>
        <h2>4. U.S. state privacy choices</h2>
        <p>
          Depending on your state and applicable legal thresholds, you may have
          rights to request access, correction, deletion, or a portable copy of
          personal information. You may also have rights to opt out of sale,
          targeted advertising, profiling with significant effects, or certain
          uses of sensitive personal information.
        </p>
        <p>
          USHCE will not discriminate against a user for exercising an
          applicable privacy right. Identity verification may be required
          before a request is completed. Authorized-agent requests will be
          handled where required by law.
        </p>
      </section>

      <section>
        <h2>5. Cookies and Global Privacy Control</h2>
        <p>
          Essential cookies support authentication and security. Optional
          categories remain off unless you grant permission. See the{" "}
          <Link href="/cookies">Cookie Notice</Link> for category and duration
          details.
        </p>
        <PrivacyChoicesButton className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted" />
        <p>
          USHCE recognizes supported Global Privacy Control signals for
          advertising, sale, and sharing opt-outs.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We retain personal information only for as long as reasonably needed
          for the purposes described in this policy, including account
          operation, security, dispute resolution, and legal compliance.
          Retention periods vary by data type and account status. Information
          may be deleted or de-identified when it is no longer needed.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          USHCE uses administrative, technical, and organizational safeguards
          designed to protect personal information. No online system is
          completely secure, so users should use a strong password and protect
          access to their email and devices.
        </p>
      </section>

      <section>
        <h2>8. Healthcare and patient information</h2>
        <p>
          USHCE is a career and hiring platform, not a patient-care or medical
          records service. Do not upload patient records, treatment information,
          or other protected patient information to profiles, job postings,
          applications, or messages.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          USHCE is intended for healthcare professionals, adult students,
          employers, and recruiters. It is not directed to children under 13,
          and we do not knowingly collect personal information from children
          under 13.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy as USHCE develops. The “Last updated” date
          shows when the current version took effect. We will provide additional
          notice when a material change requires it.
        </p>
      </section>
    </LegalPageShell>
  )
}
