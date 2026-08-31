import type { MetadataRoute } from "next"

import { getAbsoluteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/onboarding",
        "/invite/",
        "/applications/",
        "/account-suspended",
        "/report",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/update-password",
        "/verification",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getAbsoluteUrl("/"),
  }
}
