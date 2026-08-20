import type { MetadataRoute } from "next"

import { getPublishedJobs } from "@/lib/jobs/public-jobs"
import { getPublishedOrganizationPostSitemapEntries } from "@/lib/news/public-news"
import { getPublicOrganizations } from "@/lib/organizations/public-organizations"
import { resourceGuides } from "@/lib/resources/content"
import { getAbsoluteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, organizations, posts] = await Promise.all([
    getPublishedJobs(),
    getPublicOrganizations(),
    getPublishedOrganizationPostSitemapEntries(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: getAbsoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: getAbsoluteUrl("/jobs"), changeFrequency: "daily", priority: 0.9 },
    {
      url: getAbsoluteUrl("/companies"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: getAbsoluteUrl("/news"), changeFrequency: "daily", priority: 0.8 },
    {
      url: getAbsoluteUrl("/for-employers"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl("/resources"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: getAbsoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: getAbsoluteUrl("/cookies"), changeFrequency: "yearly", priority: 0.2 },
    { url: getAbsoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  ]

  const jobPages = jobs.map((job) => ({
    url: getAbsoluteUrl(`/jobs/${job.slug}`),
    lastModified: job.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const organizationPages = organizations.map((organization) => ({
    url: getAbsoluteUrl(`/companies/${organization.slug}`),
    lastModified: organization.jobs[0]?.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const newsPages = posts.map((post) => ({
    url: getAbsoluteUrl(`/news/${post.slug}`),
    lastModified: post.published_at,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const resourcePages = resourceGuides.map((guide) => ({
    url: getAbsoluteUrl(`/resources/${guide.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...resourcePages,
    ...jobPages,
    ...organizationPages,
    ...newsPages,
  ]
}
