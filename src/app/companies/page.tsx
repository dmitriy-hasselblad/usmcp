import type { Metadata } from "next"
import Link from "next/link"
import { Building2 } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { OrganizationCard } from "@/components/organizations/organization-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import { socialImageMetadata } from "@/components/seo/social-card"

export const metadata: Metadata = {
  title: "Healthcare Organizations",
  description:
    "Explore U.S. healthcare organizations with active opportunities on SM VIA.",
  alternates: { canonical: "/companies" },
  openGraph: {
    images: socialImageMetadata("/companies/opengraph-image"),
  },
  twitter: {
    card: "summary_large_image",
    images: ["/companies/opengraph-image"],
  },
}

export default async function CompaniesPage() {
  const organizations = await getPublicOrganizations()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f8fcff_0%,#eef8f8_50%,#f7fbff_100%)]">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8 lg:py-20">
            <Badge variant="outline">Healthcare organizations</Badge>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Learn about the organization before you apply.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Explore U.S. healthcare employers with currently published roles,
              workplace details, and direct paths to their opportunities.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          {organizations.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {organizations.map((organization) => (
                <OrganizationCard
                  key={organization.id}
                  organization={organization}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-white px-6 py-14 text-center shadow-sm">
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/8 text-primary">
                <Building2 className="size-6" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                Organization profiles are coming online.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                No healthcare organizations have published active roles yet.
                Browse current opportunities or check back soon.
              </p>
              <Button asChild className="mt-6 rounded-xl">
                <Link href="/jobs">Browse healthcare jobs</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
