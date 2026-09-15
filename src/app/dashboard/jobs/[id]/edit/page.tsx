import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { updateJob } from "@/app/dashboard/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { JobDescriptionEditor } from "@/components/forms/job-description-editor"
import { ProfessionSpecialtyFields } from "@/components/forms/profession-specialty-fields"
import { UsLocationFields } from "@/components/forms/us-location-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { canManageJobs, careSettings, employmentArrangements, employmentTypes, experienceLevels, licensureRequirements, relocationSupportOptions, salaryPeriods, visaPathways, visaSponsorshipOptions, workplaceTypes } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { notFound } from "next/navigation"

export const metadata: Metadata = { title: "Edit job" }

const selectClassName = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
type SearchParams = Promise<{ error?: string | string[] }>
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value

export default async function EditJobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const [{ id }, workspace, query] = await Promise.all([params, requireEmployerWorkspace("/dashboard/jobs"), searchParams])
  const canEdit = canManageJobs(workspace.membership.role)
  const { data: job } = await workspace.supabase
    .from("jobs")
    .select("id, title, profession, specialty, experience_level, city, state_code, employment_type, workplace_type, salary_min, salary_max, salary_period, description, required_skills, open_positions, employment_arrangement, new_graduates_welcome, licensure_requirement, care_settings, relocation_support, visa_sponsorship_status, visa_pathways, status, posting_duration_days")
    .eq("id", id)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()
  if (!job) notFound()

  return <EmployerDashboardShell active="jobs" email={workspace.email} organizationName={workspace.organization.name}>
    <EmployerPageHeader action={<Button asChild variant="outline"><Link href="/dashboard/jobs"><ArrowLeft /> Back to jobs</Link></Button>} eyebrow={job.status === "published" ? "Live opportunity" : "Job draft"} title="Edit job" description="Changes to a published job update its public listing without restarting its posting duration." />
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_19rem]">
      <Card className="bg-white"><CardContent className="p-6">
        <AuthNotice error={firstValue(query.error)} />
        {canEdit ? <form action={updateJob} className="mt-1 grid gap-5">
          <input name="jobId" type="hidden" value={job.id} />
          <label className="grid gap-2 text-sm font-medium">Job title<Input className="h-11" defaultValue={job.title} maxLength={160} minLength={3} name="title" required /></label>
          <div className="grid gap-5 sm:grid-cols-2"><ProfessionSpecialtyFields defaultProfession={job.profession} defaultSpecialty={job.specialty ?? ""} specialtyLabel="Specialty or department" /><label className="grid gap-2 text-sm font-medium">Experience level<select className={selectClassName} defaultValue={job.experience_level} name="experienceLevel">{experienceLevels.map((option) => <option key={option}>{option}</option>)}</select></label></div>
          <UsLocationFields cityRequired defaultCity={job.city} defaultStateCode={job.state_code} />
          <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Employment type<select className={selectClassName} defaultValue={job.employment_type} name="employmentType">{employmentTypes.map((option) => <option key={option}>{option}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Workplace type<select className={selectClassName} defaultValue={job.workplace_type} name="workplaceType">{workplaceTypes.map((option) => <option key={option}>{option}</option>)}</select></label></div>
          <label className="grid gap-2 text-sm font-medium">Open positions<Input className="h-11" defaultValue={job.open_positions} max={250} min={1} name="openPositions" required type="number" /></label>
          <label className="grid gap-2 text-sm font-medium">Required skills <span className="font-normal text-muted-foreground">Optional, comma separated</span><Input className="h-11" defaultValue={(job.required_skills ?? []).join(", ")} maxLength={800} name="requiredSkills" /></label>
          <fieldset className="grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.025] p-5"><legend className="text-base font-semibold">Hiring, licensure & mobility</legend><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Employment arrangement<select className={selectClassName} defaultValue={job.employment_arrangement ?? "Not specified"} name="employmentArrangement">{employmentArrangements.map((option) => <option key={option}>{option}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">License requirement<select className={selectClassName} defaultValue={job.licensure_requirement ?? "Not specified"} name="licensureRequirement">{licensureRequirements.map((option) => <option key={option}>{option}</option>)}</select></label></div><fieldset className="grid gap-2"><legend className="text-sm font-medium">Care settings</legend><div className="grid gap-2 sm:grid-cols-2">{careSettings.map((option) => <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm" key={option}><input className="size-4 accent-primary" defaultChecked={(job.care_settings ?? []).includes(option)} name="careSettings" type="checkbox" value={option} />{option}</label>)}</div></fieldset><label className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-sm"><input className="mt-0.5 size-4 accent-primary" defaultChecked={job.new_graduates_welcome} name="newGraduatesWelcome" type="checkbox" /><span><span className="font-semibold">New graduates welcome</span><span className="mt-1 block leading-5 text-muted-foreground">Select only when early-career applicants can be considered.</span></span></label><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Relocation assistance<select className={selectClassName} defaultValue={job.relocation_support ?? "Not offered"} name="relocationSupport">{relocationSupportOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Visa sponsorship<select className={selectClassName} defaultValue={job.visa_sponsorship_status ?? "Not offered"} name="visaSponsorship">{visaSponsorshipOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div><fieldset className="grid gap-2"><legend className="text-sm font-medium">Possible visa pathways</legend><div className="flex flex-wrap gap-2">{visaPathways.map((option) => <label className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm" key={option}><input className="size-4 accent-primary" defaultChecked={(job.visa_pathways ?? []).includes(option)} name="visaPathways" type="checkbox" value={option} />{option}</label>)}</div></fieldset></fieldset>
          <fieldset className="grid gap-3"><legend className="text-sm font-medium">Compensation range</legend><div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]"><Input aria-label="Minimum salary" className="h-11" defaultValue={job.salary_min ?? ""} min={0} name="salaryMin" type="number" /><Input aria-label="Maximum salary" className="h-11" defaultValue={job.salary_max ?? ""} min={0} name="salaryMax" type="number" /><select aria-label="Salary period" className={selectClassName} defaultValue={job.salary_period} name="salaryPeriod">{salaryPeriods.map((option) => <option key={option} value={option}>Per {option}</option>)}</select></div></fieldset>
          <fieldset className="grid gap-2"><legend className="text-sm font-medium">Job description</legend><JobDescriptionEditor initialValue={job.description} name="description" /></fieldset>
          <AuthSubmitButton pendingLabel="Saving changes...">Save changes</AuthSubmitButton>
        </form> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Your workspace role cannot edit jobs.</p>}
      </CardContent></Card>
      <Card className="h-fit bg-white"><CardContent className="p-5"><h2 className="font-semibold">Published job edits</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Editing does not reset the {job.posting_duration_days}-day posting period or change its publication date. Close the role when hiring is complete.</p></CardContent></Card>
    </div>
  </EmployerDashboardShell>
}
