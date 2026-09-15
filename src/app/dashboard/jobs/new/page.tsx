import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from "lucide-react"

import { createJobDraft } from "@/app/dashboard/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { ProfessionSpecialtyFields } from "@/components/forms/profession-specialty-fields"
import { UsLocationFields } from "@/components/forms/us-location-fields"
import { JobDescriptionEditor } from "@/components/forms/job-description-editor"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  canManageJobs,
  careSettings,
  employmentArrangements,
  employmentTypes,
  experienceLevels,
  jobPostingDurations,
  licensureRequirements,
  relocationSupportOptions,
  salaryPeriods,
  visaPathways,
  visaSponsorshipOptions,
  workplaceTypes,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Create Job",
  description: "Create a job draft for your SM VIA organization.",
}

type SearchParams = Promise<{
  error?: string | string[]
}>

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [workspace, params] = await Promise.all([
    requireEmployerWorkspace("/dashboard/jobs/new"),
    searchParams,
  ])
  const canEdit = canManageJobs(workspace.membership.role)

  return (
    <EmployerDashboardShell
      active="jobs"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/jobs">
              <ArrowLeft /> Back to jobs
            </Link>
          </Button>
        }
        description="Add the core details now. The job will remain private until you choose to publish it."
        eyebrow="New opportunity"
        title="Create a job draft"
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_19rem]">
        <Card className="bg-white">
          <CardContent className="p-6">
            <AuthNotice error={firstValue(params.error)} />
            {canEdit ? (
              <form action={createJobDraft} className="mt-1 grid gap-5">
                <label className="grid gap-2 text-sm font-medium">
                  Job title
                  <Input
                    className="h-11"
                    maxLength={160}
                    minLength={3}
                    name="title"
                    placeholder="For example, Emergency Medicine Physician"
                    required
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <ProfessionSpecialtyFields specialtyLabel="Specialty or department" />
                  <label className="grid gap-2 text-sm font-medium">
                    Experience level
                    <select
                      className={selectClassName}
                      defaultValue="Not specified"
                      name="experienceLevel"
                      required
                    >
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>


                <UsLocationFields
                  cityRequired
                  defaultStateCode={workspace.organization.state_code}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Employment type
                    <select
                      className={selectClassName}
                      defaultValue="Full-time"
                      name="employmentType"
                      required
                    >
                      {employmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Workplace type
                    <select
                      className={selectClassName}
                      defaultValue="On-site"
                      name="workplaceType"
                      required
                    >
                      {workplaceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium">
                  Posting duration
                  <select
                    className={selectClassName}
                    defaultValue="30"
                    name="postingDurationDays"
                    required
                  >
                    {jobPostingDurations.map((days) => (
                      <option key={days} value={days}>
                        {days} days{days === 30 ? " (recommended)" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-normal text-muted-foreground">
                    The countdown begins when you publish. The role will stop
                    accepting applications and move to your expired jobs list
                    at the end of the selected period.
                  </span>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Open positions
                  <Input
                    className="h-11"
                    defaultValue={1}
                    max={250}
                    min={1}
                    name="openPositions"
                    required
                    type="number"
                  />
                  <span className="text-xs font-normal text-muted-foreground">
                    Enter the number of people you are hiring for this role. Each confirmed hire reduces this count automatically.
                  </span>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Required skills <span className="font-normal text-muted-foreground">Optional</span>
                  <Input className="h-11" maxLength={800} name="requiredSkills" placeholder="For example, Epic, ACLS, patient assessment" />
                  <span className="text-xs font-normal text-muted-foreground">Separate skills with commas. These power transparent candidate recommendations.</span>
                </label>

                <fieldset className="grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.025] p-5">
                  <div>
                    <legend className="text-base font-semibold">Hiring, licensure & mobility</legend>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Help candidates understand the employment arrangement and eligibility before they apply.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Employment arrangement
                      <select className={selectClassName} defaultValue="Not specified" name="employmentArrangement">
                        {employmentArrangements.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      License requirement
                      <select className={selectClassName} defaultValue="Not specified" name="licensureRequirement">
                        {licensureRequirements.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                  </div>

                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">Care settings <span className="font-normal text-muted-foreground">Optional</span></legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {careSettings.map((setting) => (
                        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm" key={setting}>
                          <input className="size-4 accent-primary" name="careSettings" type="checkbox" value={setting} />
                          {setting}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-sm">
                    <input className="mt-0.5 size-4 accent-primary" name="newGraduatesWelcome" type="checkbox" />
                    <span>
                      <span className="font-semibold">New graduates welcome</span>
                      <span className="mt-1 block leading-5 text-muted-foreground">Select only when candidates without prior post-licensure experience can be considered.</span>
                    </span>
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Relocation assistance
                      <select className={selectClassName} defaultValue="Not offered" name="relocationSupport">
                        {relocationSupportOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Visa sponsorship
                      <select className={selectClassName} defaultValue="Not offered" name="visaSponsorship">
                        {visaSponsorshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                  </div>

                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">Possible visa pathways <span className="font-normal text-muted-foreground">Optional</span></legend>
                    <div className="flex flex-wrap gap-2">
                      {visaPathways.map((pathway) => (
                        <label className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm" key={pathway}>
                          <input className="size-4 accent-primary" name="visaPathways" type="checkbox" value={pathway} />
                          {pathway}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">Sponsorship must be evaluated individually. Do not use this field to promise a visa or immigration outcome.</p>
                  </fieldset>
                </fieldset>

                <fieldset className="grid gap-3">
                  <legend className="text-sm font-medium">
                    Compensation range
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
                    <Input
                      aria-label="Minimum salary"
                      className="h-11"
                      min={0}
                      name="salaryMin"
                      placeholder="Minimum"
                      type="number"
                    />
                    <Input
                      aria-label="Maximum salary"
                      className="h-11"
                      min={0}
                      name="salaryMax"
                      placeholder="Maximum"
                      type="number"
                    />
                    <select
                      aria-label="Salary period"
                      className={selectClassName}
                      defaultValue="year"
                      name="salaryPeriod"
                    >
                      {salaryPeriods.map((period) => (
                        <option key={period} value={period}>
                          Per {period}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>

                <label className="grid gap-2 text-sm font-medium">
                  Job description
                  <JobDescriptionEditor name="description" />
                </label>

                <AuthSubmitButton pendingLabel="Saving draft...">
                  Save job draft
                </AuthSubmitButton>
              </form>
            ) : (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                Your workspace role cannot create jobs.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                <ShieldCheck className="size-5" />
              </span>
              <h2 className="mt-4 font-semibold">Private by default</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                New jobs are saved as drafts and remain visible only inside
                your organization workspace.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-5">
              <BriefcaseBusiness className="size-5 text-primary" />
              <h2 className="mt-4 font-semibold">Publishing status</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Publishing currently marks the job ready inside your workspace.
                Public marketplace delivery is the next integration stage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerDashboardShell>
  )
}
