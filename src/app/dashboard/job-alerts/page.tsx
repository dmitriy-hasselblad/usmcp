import type { Metadata } from "next"
import { BellRing, BookmarkCheck, MapPinned } from "lucide-react"

import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { requireIdentity } from "@/lib/auth/session"
import { usStates } from "@/lib/auth/validation"
import { employmentTypes, experienceLevels, workplaceTypes } from "@/lib/employer/constants"
import { healthcareProfessions } from "@/lib/healthcare-taxonomy"

import { createSavedJobSearch, deleteSavedJobSearch, saveJobPreferences, updateSavedJobSearchAlerts } from "./actions"

export const metadata: Metadata = { title: "Job alerts", description: "Manage your private job preferences and saved searches." }

type SearchParams = Promise<{ error?: string | string[]; success?: string | string[] }>
const availabilityOptions = ["Not specified", "Immediately", "Within 30 days", "Within 1 to 3 months", "More than 3 months"] as const
const selectClassName = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }

export default async function JobAlertsPage({ searchParams }: { searchParams: SearchParams }) {
  const [identity, query] = await Promise.all([requireIdentity("/dashboard/job-alerts"), searchParams])
  const [{ data: account }, { data: preferences }, { data: searches }] = await Promise.all([
    identity.supabase.from("profiles").select("account_type, onboarding_completed").eq("id", identity.userId).single(),
    identity.supabase.from("professional_profiles").select("preferred_employment_types, preferred_workplace_types, willing_to_relocate, availability_timing").eq("user_id", identity.userId).single(),
    identity.supabase.from("saved_job_searches").select("id, name, profession, specialty, state_code, city, employment_type, workplace_type, experience_level, visa_support, search_text, alerts_enabled, email_alerts_enabled, created_at").eq("user_id", identity.userId).order("created_at", { ascending: false }),
  ])
  if (!account?.onboarding_completed || account.account_type !== "professional") return null
  const preferredEmployment = preferences?.preferred_employment_types ?? []
  const preferredWorkplace = preferences?.preferred_workplace_types ?? []
  return <ProfessionalDashboardShell active="jobAlerts" email={identity.email}>
    <div>
      <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Private job discovery</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Job preferences and alerts</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Set private preferences and save searches. New matching jobs appear in Notifications, with optional email alerts; your profile is never shared because of an alert.</p>
    </div>
    <div className="mt-7"><AuthNotice error={first(query.error)} success={first(query.success)} /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><MapPinned className="size-5 text-primary" />Career preferences</CardTitle><CardDescription>These settings help you describe the opportunities you are open to.</CardDescription></CardHeader><CardContent>
        <form action={saveJobPreferences} className="grid gap-5">
          <fieldset className="grid gap-2"><legend className="text-sm font-medium">Preferred employment types</legend><div className="flex flex-wrap gap-3">{employmentTypes.map((value) => <label className="flex items-center gap-2 text-sm" key={value}><input defaultChecked={preferredEmployment.includes(value)} name="preferredEmploymentTypes" type="checkbox" value={value} />{value}</label>)}</div></fieldset>
          <fieldset className="grid gap-2"><legend className="text-sm font-medium">Preferred workplace types</legend><div className="flex flex-wrap gap-3">{workplaceTypes.map((value) => <label className="flex items-center gap-2 text-sm" key={value}><input defaultChecked={preferredWorkplace.includes(value)} name="preferredWorkplaceTypes" type="checkbox" value={value} />{value}</label>)}</div></fieldset>
          <label className="flex items-center gap-2 text-sm font-medium"><input defaultChecked={preferences?.willing_to_relocate} name="willingToRelocate" type="checkbox" />Open to relocation within the United States</label>
          <label className="grid gap-2 text-sm font-medium">Availability<select className={selectClassName} defaultValue={preferences?.availability_timing ?? "Not specified"} name="availabilityTiming">{availabilityOptions.map((value) => <option key={value}>{value}</option>)}</select><span className="font-normal leading-5 text-muted-foreground">This is the earliest timeframe in which you could start a new role. It helps employers understand your availability if you apply; it does not share your profile or create a commitment.</span></label>
          <AuthSubmitButton pendingLabel="Saving preferences...">Save preferences</AuthSubmitButton>
        </form>
      </CardContent></Card>
      <Card className="bg-blue-50/60"><CardHeader><CardTitle className="flex items-center gap-2"><BellRing className="size-5 text-primary" />How alerts work</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">When an employer publishes a matching job, SM VIA creates a private notification for you. You can also opt in to an email for each saved search. You control every saved search and can remove it at any time.</CardContent></Card>
    </div>
    <Card className="mt-6 bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><BookmarkCheck className="size-5 text-primary" />Saved searches</CardTitle><CardDescription>Save up to 10 focused searches. Leave any filter blank to keep it broad.</CardDescription></CardHeader><CardContent className="grid gap-6">
      <form action={createSavedJobSearch} className="grid gap-4 rounded-xl border border-border bg-muted/25 p-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Search name<Input maxLength={80} minLength={2} name="name" placeholder="Florida cardiology roles" required /></label>
        <label className="grid gap-2 text-sm font-medium">Profession<select className={selectClassName} name="profession"><option value="">Any profession</option>{healthcareProfessions.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">Specialty<Input maxLength={120} name="specialty" placeholder="Optional" /></label>
        <label className="grid gap-2 text-sm font-medium">State<select className={selectClassName} name="stateCode"><option value="">Any state</option>{usStates.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">City<Input maxLength={120} name="city" placeholder="Optional" /></label>
        <label className="grid gap-2 text-sm font-medium">Employment type<select className={selectClassName} name="employmentType"><option value="">Any type</option>{employmentTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">Workplace type<select className={selectClassName} name="workplaceType"><option value="">Any setting</option>{workplaceTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">Experience level<select className={selectClassName} name="experienceLevel"><option value="">Any level</option>{experienceLevels.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium">Visa support<select className={selectClassName} name="visaSupport"><option value="">Either</option><option value="yes">Required</option><option value="no">Not required</option></select></label>
        <label className="grid gap-2 text-sm font-medium">Keyword<Input maxLength={120} name="searchText" placeholder="Optional keyword" /></label>
        <div className="grid gap-3 text-sm font-medium lg:col-span-2"><label className="flex items-center gap-2"><input defaultChecked name="alertsEnabled" type="checkbox" />Send an in-product alert when a new job matches</label><label className="flex items-center gap-2"><input name="emailAlertsEnabled" type="checkbox" />Email me when a new job matches</label></div>
        <div className="lg:col-span-2"><AuthSubmitButton pendingLabel="Saving search...">Save search</AuthSubmitButton></div>
      </form>
      {searches?.length ? <div className="grid gap-3">{searches.map((search) => <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4" key={search.id}><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{search.name}</h2><Badge variant="secondary">{search.alerts_enabled ? "In-app alerts on" : "In-app alerts off"}</Badge>{search.email_alerts_enabled ? <Badge variant="secondary">Email alerts on</Badge> : null}</div><p className="mt-1 text-sm text-muted-foreground">{[search.profession, search.specialty, search.city, search.state_code, search.employment_type, search.workplace_type].filter(Boolean).join(" · ") || "All healthcare jobs"}</p></div><div className="flex flex-wrap items-center gap-2"><form action={updateSavedJobSearchAlerts} className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs"><input name="id" type="hidden" value={search.id} /><label className="flex items-center gap-1.5"><input defaultChecked={search.alerts_enabled} name="alertsEnabled" type="checkbox" />In-app</label><label className="flex items-center gap-1.5"><input defaultChecked={search.email_alerts_enabled} name="emailAlertsEnabled" type="checkbox" />Email</label><Button size="sm" type="submit" variant="outline">Save</Button></form><form action={deleteSavedJobSearch}><input name="id" type="hidden" value={search.id} /><Button type="submit" variant="outline">Remove</Button></form></div></div>)}</div> : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No saved searches yet.</p>}
    </CardContent></Card>
  </ProfessionalDashboardShell>
}
