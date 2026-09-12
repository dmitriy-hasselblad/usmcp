import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatNewsDate,
  getSmviaCareerGuides,
  newsCoverSrc,
} from "@/lib/news/public-news"

export const metadata: Metadata = {
  title: "Career Guides | Healthcare News & Insights",
  description:
    "Practical, independently researched guidance for U.S. healthcare careers.",
  alternates: { canonical: "/news/guides" },
}

export default async function CareerGuidesPage() {
  const guides = await getSmviaCareerGuides()

  return (
    <div className="min-h-dvh bg-[#f4f8fb] text-slate-950">
      <SiteHeader />
      <main>
        <section className="border-b border-sky-100 bg-[#eaf6fc]">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <Link className="text-sm font-semibold text-teal-700 hover:underline" href="/news">
              ← Back to News & insights
            </Link>
            <p className="mt-8 text-xs font-bold tracking-[0.2em] text-sky-800/70 uppercase">
              SM VIA editorial
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-[#0c2340] sm:text-6xl">
              Career guides for U.S. healthcare.
            </h1>
            <p className="mt-5 max-w-2xl font-serif text-xl leading-8 text-slate-600">
              Practical, independently researched guidance for your next healthcare career decision.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          {guides.length ? (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Card className="group overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl" key={guide.id}>
                  {newsCoverSrc(guide) && (
                    <div className="relative aspect-[16/8] overflow-hidden">
                      <Image
                        alt=""
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={newsCoverSrc(guide)!}
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <Badge className="rounded-full border-0 bg-[#d9f4f5] px-3 py-1 text-[0.65rem] text-teal-700" variant="secondary">
                      SM VIA Career Guide
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Published {formatNewsDate(guide.published_at)}
                    </p>
                    <h2 className="mt-4 font-serif text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#142c48]">
                      <Link className="hover:text-primary" href={`/news/${guide.slug}`}>
                        {guide.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{guide.excerpt}</p>
                    <Link className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:underline" href={`/news/${guide.slug}`}>
                      Read guide →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <h2 className="font-serif text-3xl font-semibold">Career guides are coming soon.</h2>
                <p className="mt-3 text-muted-foreground">Please check back for practical healthcare career guidance.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
