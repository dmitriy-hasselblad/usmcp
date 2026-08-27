import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CircleHelp, Mail } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about SM VIA accounts, jobs, employer workspaces, privacy, and Early Access.",
  alternates: { canonical: "/faq" },
}

const questions = [
  {
    question: "What is SM VIA?",
    answer:
      "SM VIA — Specialized Medical Vocations & Industry Alliance — is a U.S. healthcare career and hiring platform. It brings together professionals, employers, published opportunities, and practical career resources in one place.",
  },
  {
    question: "Is SM VIA free to use?",
    answer:
      "Yes. During Early Access, SM VIA is free for healthcare professionals and employers, with no limit on job postings or applications. If paid services are introduced in the future, we will announce the change at least 30 days in advance.",
  },
  {
    question: "Who can create an account?",
    answer:
      "Healthcare professionals, students, residents, recruiters, and authorized representatives of U.S. healthcare organizations can create an account. Choose the account type that best matches how you plan to use the platform.",
  },
  {
    question: "How do job applications work?",
    answer:
      "Candidates can apply to published roles through SM VIA. Employers manage applicants from their private workspace, communicate securely, share application-related attachments, and schedule interviews when appropriate.",
  },
  {
    question: "Are job listings publicly visible?",
    answer:
      "Yes. Published jobs are available to visitors in the public job search. Draft, archived, expired, and filled roles are not shown in public results.",
  },
  {
    question: "How does organization verification work?",
    answer:
      "Organizations can provide information for platform review. A verification label helps candidates understand the organization’s public status. Verification does not replace a candidate’s own due diligence before accepting an offer.",
  },
  {
    question: "Is my professional profile public?",
    answer:
      "No. Professional profiles are private by default. You control whether eligible employer workspaces can discover your extended profile, and you can update that preference at any time.",
  },
  {
    question: "Can an employer add team members?",
    answer:
      "Yes. Organization owners can invite team members and assign an appropriate workspace role. Access is managed within the organization’s private team area.",
  },
  {
    question: "How can I contact SM VIA?",
    answer:
      "Use the Contact page to send a question, share feedback, or report an issue. For safety concerns involving published content, use the Report content link shown on the relevant public page.",
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-20">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
                Help center
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                Frequently asked questions.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Clear answers for healthcare professionals and organizations using SM VIA.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
              <CircleHelp className="size-7 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">Still need help?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Our team is building SM VIA in collaboration with its Early Access community.
              </p>
              <Button asChild className="mt-5 rounded-xl" variant="outline">
                <Link href="/contact">
                  Contact SM VIA <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-3">
            {questions.map((item) => (
              <details
                className="group rounded-2xl border border-border bg-white px-6 py-5 shadow-sm"
                key={item.question}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-lg font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-base font-normal text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pt-4 leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-white p-6 text-center shadow-sm sm:p-8">
            <Mail className="mx-auto size-6 text-primary" />
            <h2 className="mt-3 text-xl font-semibold">Couldn’t find your answer?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Send us a message and we’ll use your feedback to improve SM VIA.
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
