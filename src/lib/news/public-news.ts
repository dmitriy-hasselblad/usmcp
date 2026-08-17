import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

const selection =
  "id, organization_id, slug, title, excerpt, body, cover_image_path, published_at, organizations(name, slug, organization_type, state_code)"

export const newsMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export const newsPageSize = 12

export const getPublishedOrganizationPosts = cache(
  async (year?: number, month?: number, page = 1, organizationId?: string) => {
    const from = (page - 1) * newsPageSize
    let query = (await createClient())
      .from("organization_posts")
      .select(selection, { count: "exact" })
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("published_at", { ascending: false })
      .range(from, from + newsPageSize - 1)

    if (year) {
      const startMonth = month ? month - 1 : 0
      const endYear = month === 12 ? year + 1 : year
      const endMonth = month ? month % 12 : 0
      const start = new Date(Date.UTC(year, startMonth, 1)).toISOString()
      const end = new Date(
        Date.UTC(month ? endYear : year + 1, endMonth, 1),
      ).toISOString()
      query = query.gte("published_at", start).lt("published_at", end)
    }

    if (organizationId) {
      query = query.eq("organization_id", organizationId)
    }

    const { data, count } = await query
    return { posts: data ?? [], count: count ?? 0 }
  },
)

export const getLatestPublishedOrganizationPost = cache(
  async (organizationId: string) => {
    const { data } = await (await createClient())
      .from("organization_posts")
      .select(selection)
      .eq("organization_id", organizationId)
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    return data
  },
)

export const getNewsArchiveYears = cache(async () => {
  const { data } = await (await createClient())
    .from("organization_posts")
    .select("published_at")
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("published_at", { ascending: false })
    .limit(2000)

  return [
    ...new Set(
      (data ?? [])
        .map((post) => post.published_at)
        .filter((value): value is string => Boolean(value))
        .map((value) => new Date(value).getUTCFullYear()),
    ),
  ].sort((a, b) => b - a)
})

export const getPublishedOrganizationPost = cache(async (slug: string) => {
  const { data } = await (await createClient())
    .from("organization_posts")
    .select(selection)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .maybeSingle()
  return data
})

export const getPublicNewsOrganization = cache(async (organizationId: string) => {
  const { data } = await (await createClient())
    .from("organizations")
    .select(
      "name, slug, state_code, website, public_email, public_phone, address_line1, address_line2, city, postal_code",
    )
    .eq("id", organizationId)
    .maybeSingle()
  return data
})

export const getPublishedOrganizationPostSitemapEntries = cache(async () => {
  const { data } = await (await createClient())
    .from("organization_posts")
    .select("slug, published_at")
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("published_at", { ascending: false })
    .limit(2000)

  return (data ?? []).filter(
    (post): post is { slug: string; published_at: string } =>
      Boolean(post.slug && post.published_at),
  )
})

export function formatNewsDate(value: string | null) {
  if (!value) return "Publication date unavailable"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value))
}

export function parseNewsYear(value?: string) {
  if (!value || !/^\d{4}$/.test(value)) return undefined
  const year = Number(value)
  const maximumYear = new Date().getUTCFullYear() + 1
  return year >= 2000 && year <= maximumYear ? year : undefined
}

export function parseNewsMonth(value?: string, year?: number) {
  if (!year || !value || !/^\d{1,2}$/.test(value)) return undefined
  const month = Number(value)
  return month >= 1 && month <= 12 ? month : undefined
}

export function parseNewsPage(value?: string) {
  if (!value || !/^\d+$/.test(value)) return 1
  const page = Number(value)
  return page >= 1 && page <= 10000 ? page : 1
}
