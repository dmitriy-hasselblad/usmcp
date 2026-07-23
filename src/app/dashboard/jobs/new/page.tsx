import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from "lucide-react"

import { createJobDraft } from "@/app/dashboard/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usStates } from "@/lib/auth/validation"
import {
  canManageJobs,
  employmentTypes,
  salaryPeriods,
  workplaceTypes,
} from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"

export const metadata: Metadata = {
  title: "Create Job",
  description: "Create a job draft for your USHCE organization.",
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

                <label className="grid gap-2 text-sm font-medium">
                  Specialty or department
                  <Input
                    className="h-11"
                    maxLength={120}
                    name="specialty"
                    placeholder="For example, Emergency Medicine"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    City
                    <Input
                      className="h-11"
                      maxLength={120}
                      minLength={2}
                      name="city"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    State
                    <select
                      className={selectClassName}
                      defaultValue={workspace.organization.state_code}
                      name="stateCode"
                      required
                    >
                      {usStates.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

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
                  <Textarea
                    maxLength={10000}
                    name="description"
                    placeholder="Describe the role, responsibilities, qualifications, schedule, and benefits."
                    rows={10}
                  />
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/35 p-4 text-sm">
                  <input
                    className="mt-0.5 size-4 accent-primary"
                    name="visaSupport"
                    type="checkbox"
                  />
                  <span>
                    <span className="font-semibold">
                      Visa support may be available
                    </span>
                    <span className="mt-1 block leading-5 text-muted-foreground">
                      Mark this only when your organization can evaluate
                      sponsorship or immigration support for qualified
                      candidates.
                    </span>
                  </span>
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
