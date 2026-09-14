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

export const getPublishedNewsPosts = cache(async () => {
  const { data } = await (await createClient())
    .from("organization_posts")
    .select(selection)
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("published_at", { ascending: false })
    .limit(2000)

  return data ?? []
})

export const getSmviaCareerGuides = cache(async () => {
  const { data } = await (await createClient())
    .from("organization_posts")
    .select(selection)
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("published_at", { ascending: false })
    .limit(2000)

  return (data ?? []).filter(isSmviaCareerGuide)
})

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

const editorialCoverBySlug: Record<string, string> = {
  "compare-nursing-job-offers": "/images/news/news-hero-nurse.png",
  "compact-nursing-license-basics": "/images/news/licensure-cover.png",
  "texas-nursing-license-move-plan": "/images/news/texas-move-cover.png",
  "registered-nurse-salary-florida-context": "/images/news/florida-salary-cover.png",
  "how-to-evaluate-hospital-employer": "/images/news/job-search-cover.png",
  "nurse-practitioner-vs-physician-associate": "/images/news/advanced-practice-cover.png",
  "travel-nursing-role-questions": "/images/news/travel-nursing-cover.png",
  "prepare-healthcare-interview": "/images/news/healthcare-interview-cover.png",
  "licensure-when-relocating": "/images/news/relocating-cover.png",
  "use-official-healthcare-job-postings": "/images/news/official-job-postings-cover.png",
}

export type EditorialGuideSource = {
  label: string
  publisher: string
  href: string
}

const editorialGuideSourcesBySlug: Record<string, EditorialGuideSource[]> = {
  "compare-nursing-job-offers": [
    { label: "Leave benefits", publisher: "U.S. Department of Labor", href: "https://www.dol.gov/general/topic/benefits-leave" },
    { label: "Registered Nurses: occupation profile", publisher: "O*NET OnLine / U.S. Department of Labor", href: "https://www.onetonline.org/link/summary/29-1141.00" },
  ],
  "compact-nursing-license-basics": [
    { label: "How the Nurse Licensure Compact works", publisher: "Nurse Licensure Compact", href: "https://nursecompact.com/how-it-works.page" },
    { label: "Contact a Board of Nursing", publisher: "NCSBN", href: "https://www.ncsbn.org/contact-bon.page" },
  ],
  "texas-nursing-license-move-plan": [
    { label: "Licensure by endorsement", publisher: "Texas Board of Nursing", href: "https://www.bon.texas.gov/licensure_endorsement.asp.html" },
    { label: "Nurses and the Nurse Licensure Compact", publisher: "Nurse Licensure Compact", href: "https://nursecompact.com/how-it-works/nurses-and-the-nlc.page" },
  ],
  "registered-nurse-salary-florida-context": [
    { label: "Florida occupational employment and wage estimates", publisher: "U.S. Bureau of Labor Statistics", href: "https://www.bls.gov/oes/2023/may/oes_fl.htm" },
    { label: "Occupational Employment and Wage Statistics tables", publisher: "U.S. Bureau of Labor Statistics", href: "https://www.bls.gov/oes/tables.htm" },
  ],
  "how-to-evaluate-hospital-employer": [
    { label: "Job scams: how to spot and avoid them", publisher: "Federal Trade Commission", href: "https://consumer.ftc.gov/articles/job-scams" },
    { label: "Registered Nurses: occupation profile", publisher: "O*NET OnLine / U.S. Department of Labor", href: "https://www.onetonline.org/link/summary/29-1141.00" },
  ],
  "nurse-practitioner-vs-physician-associate": [
    { label: "Nurse Practitioner Certification Board", publisher: "AANPCB / NPCB", href: "https://www.aanpcert.org/" },
    { label: "NCCPA certification information", publisher: "National Commission on Certification of Physician Assistants", href: "https://www.nccpa.net/" },
    { label: "Contact a Board of Nursing", publisher: "NCSBN", href: "https://www.ncsbn.org/contact-bon.page" },
  ],
  "travel-nursing-role-questions": [
    { label: "Travel nurses and the Nurse Licensure Compact", publisher: "Nurse Licensure Compact", href: "https://nursecompact.com/how-it-works/nurses-and-the-nlc.page" },
    { label: "Contact a Board of Nursing", publisher: "NCSBN", href: "https://www.ncsbn.org/contact-bon.page" },
  ],
  "prepare-healthcare-interview": [
    { label: "Registered Nurses: occupation profile", publisher: "O*NET OnLine / U.S. Department of Labor", href: "https://www.onetonline.org/link/summary/29-1141.00" },
  ],
  "licensure-when-relocating": [
    { label: "Nurses and the Nurse Licensure Compact", publisher: "Nurse Licensure Compact", href: "https://nursecompact.com/how-it-works/nurses-and-the-nlc.page" },
    { label: "Contact a Board of Nursing", publisher: "NCSBN", href: "https://www.ncsbn.org/contact-bon.page" },
  ],
  "use-official-healthcare-job-postings": [
    { label: "Job scams: how to spot and avoid them", publisher: "Federal Trade Commission", href: "https://consumer.ftc.gov/articles/job-scams" },
    { label: "How to create an application", publisher: "USAJOBS Help Center", href: "https://help.usajobs.gov/how-to/application" },
  ],
}

export function getEditorialGuideSources(slug: string) {
  return editorialGuideSourcesBySlug[slug] ?? []
}

export function isSmviaCareerGuide(post: {
  slug: string
}) {
  return Boolean(editorialCoverBySlug[post.slug])
}

export function newsCoverSrc(post: {
  id: string
  slug: string
  cover_image_path?: string | null
}) {
  return post.cover_image_path
    ? `/news/image/${post.id}`
    : editorialCoverBySlug[post.slug]
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
