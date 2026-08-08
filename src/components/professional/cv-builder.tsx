"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

type CareerItem = {
  title: string
  subtitle: string
  dates?: string
  description?: string | null
}

export type CvData = {
  name: string
  contact: string[]
  headline?: string | null
  summary?: string | null
  skills: string[]
  languages: string[]
  experience: CareerItem[]
  education: CareerItem[]
  licenses: CareerItem[]
  certifications: CareerItem[]
}

export function CvBuilder({ cv }: { cv: CvData }) {
  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm text-muted-foreground">Your CV is generated from your private USHCE profile and Career History.</p>
        </div>
        <Button onClick={() => window.print()}>
          <Download /> Export as PDF
        </Button>
      </div>
      <article className="cv-document mx-auto max-w-[8.5in] bg-white p-7 text-slate-900 shadow-sm sm:p-10 print:max-w-none print:p-0 print:shadow-none">
        <header className="border-b-2 border-primary pb-6">
          <h1 className="text-3xl font-bold tracking-[-0.04em]">{cv.name}</h1>
          {cv.headline && <p className="mt-2 text-lg font-medium text-primary">{cv.headline}</p>}
          {cv.contact.length > 0 && <p className="mt-3 text-sm text-slate-600">{cv.contact.join(" · ")}</p>}
        </header>
        {cv.summary && <CvSection title="Professional summary"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{cv.summary}</p></CvSection>}
        {cv.experience.length > 0 && <CvSection title="Professional experience"><CvItems items={cv.experience} /></CvSection>}
        {cv.education.length > 0 && <CvSection title="Education and training"><CvItems items={cv.education} /></CvSection>}
        {cv.licenses.length > 0 && <CvSection title="Licenses"><CvItems items={cv.licenses} /></CvSection>}
        {cv.certifications.length > 0 && <CvSection title="Certifications"><CvItems items={cv.certifications} /></CvSection>}
        {cv.skills.length > 0 && <CvSection title="Skills"><p className="text-sm leading-6 text-slate-700">{cv.skills.join(" · ")}</p></CvSection>}
        {cv.languages.length > 0 && <CvSection title="Languages"><p className="text-sm leading-6 text-slate-700">{cv.languages.join(" · ")}</p></CvSection>}
      </article>
      <style jsx global>{`@media print { @page { size: letter; margin: .55in; } body { background: #fff !important; } .cv-document { font-family: Arial, sans-serif; } }`}</style>
    </>
  )
}

function CvSection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="mt-7 break-inside-avoid"><h2 className="border-b border-slate-300 pb-1 text-xs font-bold tracking-[0.14em] text-primary uppercase">{title}</h2><div className="mt-3">{children}</div></section>
}

function CvItems({ items }: { items: CareerItem[] }) {
  return <div className="grid gap-4">{items.map((item) => <div key={`${item.title}-${item.subtitle}`} className="break-inside-avoid"><div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><div><h3 className="text-sm font-bold">{item.title}</h3><p className="text-sm text-slate-700">{item.subtitle}</p></div>{item.dates && <p className="text-xs font-medium text-slate-500">{item.dates}</p>}</div>{item.description && <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.description}</p>}</div>)}</div>
}
