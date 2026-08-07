import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { ReportContentLink } from "@/components/moderation/report-content-link"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicOrganizationBySlug } from "@/lib/organizations/public-organizations"

type OrganizationPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: OrganizationPageProps): Promise<Metadata> {
  const { slug } = await params
  const organization = await getPublicOrganizationBySlug(slug)

  if (!organization) {
    return { title: "Organization not found" }
  }

  return {
    title: organization.name,
    description:
      organization.description ||
      `Explore healthcare opportunities from ${organization.name}.`,
  }
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params
  const organization = await getPublicOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  const isVerified = organization.verificationStatus === "verified"

  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/companies"
            >
              <ArrowLeft className="size-4" />
              Back to healthcare organizations
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary/8 text-primary">
                <Building2 className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <Badge
                  className={
                    isVerified
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : undefined
                  }
                  variant="outline"
                >
                  {isVerified ? "Verified organization" : "Employer-published"}
                </Badge>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {organization.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4" />
                    {organization.type}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {organization.location}
                  </span>
                </div>
              </div>
              {organization.website && (
                <Button asChild className="rounded-xl" variant="outline">
                  <a
                    href={organization.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit website <ArrowUpRight />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8 lg:py-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              About {organization.name}
            </h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
              {organization.description ||
                "This organization has not added a public description yet."}
            </p>

            <div className="mt-12 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                  Active opportunities
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  Published roles
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {organization.jobs.length}{" "}
                {organization.jobs.length === 1 ? "role" : "roles"}
              </span>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {organization.jobs.map((job) => (
                <JobCard job={job} key={job.id ?? job.slug} />
              ))}
            </div>
          </div>

          <aside>
            <Card className="sticky top-24 border-primary/15 bg-white">
              <CardContent className="p-6">
                <ShieldCheck className="size-6 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">
                  Public profile information
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This page shows only organization details approved for public
                  display and roles currently published on USHCE. Membership and
                  private contact information are not shown.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <div className="mx-auto flex max-w-7xl justify-end px-5 pb-8 lg:px-8"><ReportContentLink returnTo={`/companies/${organization.slug}`} targetId={organization.id} targetType="organization" /></div>
      <SiteFooter />
    </div>
  )
}
