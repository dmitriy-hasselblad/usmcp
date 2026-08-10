import type { Metadata } from "next"
import { FileText } from "lucide-react"
import { redirect } from "next/navigation"

import { CvBuilder, type CvData } from "@/components/professional/cv-builder"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { requireIdentity } from "@/lib/auth/session"
import { educationTypeLabels, type CertificationRecord, type EducationRecord, type ExperienceRecord, type LicenseRecord } from "@/lib/professional/career-records"
import type { ProfessionalProfileRecord, ProfessionalSkillRecord } from "@/lib/professional/constants"

export const metadata: Metadata = { title: "CV Builder", description: "Create a healthcare CV from your private USHCE career profile." }

export default async function CvBuilderPage() {
  const identity = await requireIdentity("/dashboard/profile/cv")
  const [account, extended, skills, experience, education, licenses, certifications] = await Promise.all([
    identity.supabase.from("profiles").select("account_type, onboarding_completed, first_name, last_name").eq("id", identity.userId).single(),
    identity.supabase.from("professional_profiles").select("*").eq("user_id", identity.userId).single(),
    identity.supabase.from("professional_skills").select("*").eq("user_id", identity.userId).order("name"),
    identity.supabase.from("professional_experience").select("*").eq("user_id", identity.userId).order("start_date", { ascending: false }),
    identity.supabase.from("professional_education").select("*").eq("user_id", identity.userId).order("start_date", { ascending: false }),
    identity.supabase.from("professional_licenses").select("*").eq("user_id", identity.userId).order("expires_on", { ascending: true }),
    identity.supabase.from("professional_certifications").select("*").eq("user_id", identity.userId).order("issued_on", { ascending: false }),
  ])
  if (!account.data?.onboarding_completed || !extended.data) redirect("/onboarding")
  if (account.data.account_type !== "professional") redirect("/dashboard/organization")
  const profile = extended.data as ProfessionalProfileRecord
  const dateRange = (start?: string | null, end?: string | null, current?: boolean) => `${formatDate(start)} - ${current ? "Present" : formatDate(end)}`
  const contact = [
    identity.email,
    [profile.city, profile.state_code].filter(Boolean).join(", "),
  ].filter((value): value is string => Boolean(value))

  const cv: CvData = {
    name: [account.data.first_name, account.data.last_name].filter(Boolean).join(" "),
    contact,
    headline: profile.headline || [profile.profession, profile.specialty].filter(Boolean).join(" | "), summary: profile.biography,
    skills: ((skills.data ?? []) as ProfessionalSkillRecord[]).map((skill) => skill.name), languages: profile.languages ?? [],
    experience: ((experience.data ?? []) as ExperienceRecord[]).map((item) => ({ title: item.role_title, subtitle: [item.organization_name, item.employment_type, [item.city, item.state_code].filter(Boolean).join(", ")].filter(Boolean).join(" | "), dates: dateRange(item.start_date, item.end_date, item.is_current), description: item.description })),
    education: ((education.data ?? []) as EducationRecord[]).map((item) => ({ title: item.program, subtitle: [item.institution, educationTypeLabels[item.education_type], item.specialty].filter(Boolean).join(" | "), dates: dateRange(item.start_date, item.end_date, item.is_current), description: item.description })),
    licenses: ((licenses.data ?? []) as LicenseRecord[]).map((item) => ({ title: item.license_type, subtitle: `${item.issuing_state} license${item.license_number ? ` | ${item.license_number}` : ""}`, dates: item.expires_on ? `Expires ${formatDate(item.expires_on)}` : undefined })),
    certifications: ((certifications.data ?? []) as CertificationRecord[]).map((item) => ({ title: item.name, subtitle: item.issuing_organization, dates: item.expires_on ? `Expires ${formatDate(item.expires_on)}` : undefined })),
  }
  return <ProfessionalDashboardShell active="cv" email={identity.email}><div className="flex flex-wrap items-start justify-between gap-5 print:hidden"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Private document workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">CV Builder</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Review your professional CV, then export a private PDF when it is ready.</p></div><Badge className="bg-blue-50 text-primary" variant="secondary"><FileText /> Built from your profile</Badge></div><div className="mt-8"><CvBuilder cv={cv} /></div></ProfessionalDashboardShell>
}

function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "" }
