import Link from "next/link"

import { getAbsoluteUrl, serializeJsonLd } from "@/lib/seo"

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: getAbsoluteUrl(item.href) } : {}),
    })),
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        type="application/ld+json"
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          {items.map((item, index) => (
            <li className="flex items-center gap-x-2" key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? (
                <Link className="font-medium text-primary hover:underline" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
