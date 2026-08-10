"use client"

import Link from "next/link"
import { Download, Plus, Save, Trash2 } from "lucide-react"
import { useState } from "react"

import { saveResume } from "@/app/dashboard/resumes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeContent, ResumeEntry } from "@/lib/resume/types"
import type { ResumeExportAccess } from "@/lib/resume/export-access"

const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean)
const blankEntry = (): ResumeEntry => ({ id: crypto.randomUUID(), title: "", organization: "", location: "", startDate: "", endDate: "", details: "" })

export function ResumeEditor({ exportAccess, initialContent, resumeId, title: initialTitle }: { exportAccess: ResumeExportAccess; initialContent: ResumeContent; resumeId: string; title: string }) {
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const set = (field: keyof ResumeContent, value: string) => setContent((current) => ({ ...current, [field]: value }))
  const updateEntry = (section: "experience" | "education", id: string, field: keyof ResumeEntry, value: string) => setContent((current) => ({ ...current, [section]: current[section].map((entry) => entry.id === id ? { ...entry, [field]: value } : entry) }))
  const removeEntry = (section: "experience" | "education", id: string) => setContent((current) => ({ ...current, [section]: current[section].filter((entry) => entry.id !== id) }))
  const addEntry = (section: "experience" | "education") => setContent((current) => ({ ...current, [section]: [...current[section], blankEntry()] }))

  return <div>
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden"><div><Link className="text-sm font-semibold text-primary hover:underline" href="/dashboard/resumes">← My résumés</Link><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">U.S. Healthcare Résumé Builder</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Use concise, fact-based language and reverse chronological order. Do not include a photo, age, gender, marital status, Social Security number, or references.</p></div><div className="flex gap-2"><Button disabled={!exportAccess.allowed} onClick={() => window.print()} type="button" variant="outline"><Download/>Export PDF</Button><Button form="resume-form" type="submit"><Save/>Save résumé</Button></div></div>
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 print:hidden"><strong>Early Access:</strong> saving and PDF export are currently free. If paid export is introduced later, pricing will be shown before checkout and your drafts will remain intact.</div>
    <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(32rem,0.9fr)]">
      <form action={saveResume} className="grid gap-5 print:hidden" id="resume-form"><input name="resumeId" type="hidden" value={resumeId}/><input name="content" type="hidden" value={JSON.stringify(content)}/>
        <EditorSection title="Document"><Field label="Résumé name"><Input maxLength={120} onChange={(event) => setTitle(event.target.value)} required value={title}/></Field><input name="title" type="hidden" value={title}/></EditorSection>
        <EditorSection title="Contact information"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><Input maxLength={120} onChange={(e) => set("fullName", e.target.value)} value={content.fullName}/></Field><Field label="City, State"><Input maxLength={120} onChange={(e) => set("cityState", e.target.value)} placeholder="Chicago, IL" value={content.cityState}/></Field><Field label="Phone"><Input maxLength={30} onChange={(e) => set("phone", e.target.value)} value={content.phone}/></Field><Field label="Professional email"><Input maxLength={160} onChange={(e) => set("email", e.target.value)} type="email" value={content.email}/></Field><Field label="LinkedIn URL"><Input maxLength={300} onChange={(e) => set("linkedin", e.target.value)} type="url" value={content.linkedin}/></Field></div></EditorSection>
        <EditorSection title="Professional summary"><Textarea maxLength={1200} onChange={(e) => set("summary", e.target.value)} placeholder="2–4 concise lines tailored to the role." rows={5} value={content.summary}/></EditorSection>
        <EditorSection title="Licenses"><Textarea maxLength={3000} onChange={(e) => set("licenses", e.target.value)} placeholder={"Registered Nurse — Illinois, active\nBLS — American Heart Association"} rows={4} value={content.licenses}/></EditorSection>
        <EntriesEditor entries={content.experience} label="Professional experience" onAdd={() => addEntry("experience")} onRemove={(id) => removeEntry("experience", id)} onUpdate={(id, field, value) => updateEntry("experience", id, field, value)}/>
        <EntriesEditor entries={content.education} label="Education and clinical training" onAdd={() => addEntry("education")} onRemove={(id) => removeEntry("education", id)} onUpdate={(id, field, value) => updateEntry("education", id, field, value)}/>
        <EditorSection title="Certifications"><Textarea maxLength={3000} onChange={(e) => set("certifications", e.target.value)} placeholder="One certification per line" rows={4} value={content.certifications}/></EditorSection>
        <EditorSection title="Skills"><Textarea maxLength={3000} onChange={(e) => set("skills", e.target.value)} placeholder="One clinical or technical skill per line" rows={5} value={content.skills}/></EditorSection>
        <EditorSection title="Languages"><Textarea maxLength={1500} onChange={(e) => set("languages", e.target.value)} placeholder="English — Fluent" rows={3} value={content.languages}/></EditorSection>
      </form>
      <ResumePreview content={content}/>
    </div>
  </div>
}

function EditorSection({ children, title }: { children: React.ReactNode; title: string }) { return <Card className="bg-white"><CardContent className="grid gap-4 p-5"><h2 className="font-semibold">{title}</h2>{children}</CardContent></Card> }
function Field({ children, label }: { children: React.ReactNode; label: string }) { return <label className="grid gap-2 text-sm font-medium">{label}{children}</label> }

function EntriesEditor({ entries, label, onAdd, onRemove, onUpdate }: { entries: ResumeEntry[]; label: string; onAdd: () => void; onRemove: (id: string) => void; onUpdate: (id: string, field: keyof ResumeEntry, value: string) => void }) {
  return <EditorSection title={label}>{entries.map((entry, index) => <div className="grid gap-3 rounded-xl border p-4" key={entry.id}><div className="flex items-center justify-between"><strong className="text-sm">Entry {index + 1}</strong><Button aria-label={`Remove ${label} entry ${index + 1}`} onClick={() => onRemove(entry.id)} size="icon" type="button" variant="ghost"><Trash2/></Button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Role or degree"><Input maxLength={120} onChange={(e) => onUpdate(entry.id, "title", e.target.value)} value={entry.title}/></Field><Field label="Organization or school"><Input maxLength={120} onChange={(e) => onUpdate(entry.id, "organization", e.target.value)} value={entry.organization}/></Field><Field label="Location"><Input maxLength={120} onChange={(e) => onUpdate(entry.id, "location", e.target.value)} value={entry.location}/></Field><Field label="Dates"><div className="grid grid-cols-2 gap-2"><Input aria-label="Start date" maxLength={30} onChange={(e) => onUpdate(entry.id, "startDate", e.target.value)} placeholder="Jan 2024" value={entry.startDate}/><Input aria-label="End date" maxLength={30} onChange={(e) => onUpdate(entry.id, "endDate", e.target.value)} placeholder="Present" value={entry.endDate}/></div></Field></div><Field label="Achievements and responsibilities"><Textarea maxLength={4000} onChange={(e) => onUpdate(entry.id, "details", e.target.value)} placeholder="One achievement-focused bullet per line" rows={5} value={entry.details}/></Field></div>)}<Button disabled={entries.length >= 20} onClick={onAdd} type="button" variant="outline"><Plus/>Add entry</Button></EditorSection>
}

function ResumePreview({ content }: { content: ResumeContent }) {
  const section = (title: string, children: React.ReactNode, show: boolean) => show && <section className="mt-5 break-inside-avoid"><h2 className="border-b border-slate-400 pb-1 text-[11px] font-bold tracking-[0.12em] uppercase">{title}</h2><div className="mt-2">{children}</div></section>
  const entryList = (items: ResumeEntry[]) => <div className="grid gap-4">{items.map((entry) => <div className="break-inside-avoid" key={entry.id}><div className="flex justify-between gap-3"><div><h3 className="font-bold">{entry.title || "Role or degree"}</h3><p>{[entry.organization, entry.location].filter(Boolean).join(" · ")}</p></div><p className="shrink-0 text-xs">{[entry.startDate, entry.endDate].filter(Boolean).join(" – ")}</p></div>{lines(entry.details).length > 0 && <ul className="mt-1 list-disc space-y-1 pl-5">{lines(entry.details).map((line, index) => <li key={`${entry.id}-${index}`}>{line}</li>)}</ul>}</div>)}</div>
  return <article className="resume-document sticky top-4 min-h-[11in] bg-white p-[0.55in] text-[10.5pt] leading-[1.35] text-slate-950 shadow-sm ring-1 ring-slate-200 print:static print:min-h-0 print:p-0 print:shadow-none print:ring-0"><header className="text-center"><h1 className="text-2xl font-bold tracking-tight">{content.fullName || "Your Name"}</h1><p className="mt-1 text-xs">{[content.cityState, content.phone, content.email, content.linkedin].filter(Boolean).join(" · ")}</p></header>{section("Professional Summary", <p className="whitespace-pre-wrap">{content.summary}</p>, Boolean(content.summary))}{section("Licenses", <ul className="list-disc pl-5">{lines(content.licenses).map((line) => <li key={line}>{line}</li>)}</ul>, Boolean(content.licenses))}{section("Professional Experience", entryList(content.experience), content.experience.length > 0)}{section("Education and Clinical Training", entryList(content.education), content.education.length > 0)}{section("Certifications", <ul className="list-disc pl-5">{lines(content.certifications).map((line) => <li key={line}>{line}</li>)}</ul>, Boolean(content.certifications))}{section("Skills", <p>{lines(content.skills).join(" · ")}</p>, Boolean(content.skills))}{section("Languages", <p>{lines(content.languages).join(" · ")}</p>, Boolean(content.languages))}<style jsx global>{`@media print { @page { size: letter; margin: .55in; } body { background: white !important; } body * { visibility: hidden; } .resume-document, .resume-document * { visibility: visible; } .resume-document { position: absolute; inset: 0; width: 100%; font-family: Arial, sans-serif; } }`}</style></article>
}
