import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { redirect } from "next/navigation"

import {
  deleteCareerRecord,
  saveCertification,
  saveEducation,
  saveExperience,
  saveLicense,
} from "@/app/dashboard/profile/career/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireIdentity } from "@/lib/auth/session"
import { usStates } from "@/lib/auth/validation"
import {
  educationTypeLabels,
  educationTypes,
  employmentTypes,
  type CertificationRecord,
  type EducationRecord,
  type ExperienceRecord,
  type LicenseRecord,
} from "@/lib/professional/career-records"

export const metadata: Metadata = {
  title: "Career history",
  description: "Manage structured healthcare career credentials in USHCE.",
}

type SearchParams = Promise<{
  editCertification?: string
  editEducation?: string
  editExperience?: string
  editLicense?: string
  error?: string | string[]
  success?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function CareerHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [identity, query] = await Promise.all([
    requireIdentity("/dashboard/profile/career"),
    searchParams,
  ])
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }
  if (profile.account_type !== "professional") {
    redirect("/dashboard/organization")
  }

  const [educationResult, experienceResult, licenseResult, certificationResult, extendedResult, skillResult] =
    await Promise.all([
      identity.supabase
        .from("professional_education")
        .select("*")
        .eq("user_id", identity.userId)
        .order("start_date", { ascending: false }),
      identity.supabase
        .from("professional_experience")
        .select("*")
        .eq("user_id", identity.userId)
        .order("start_date", { ascending: false }),
      identity.supabase
        .from("professional_licenses")
        .select("*")
        .eq("user_id", identity.userId)
        .order("expires_on", { ascending: true }),
      identity.supabase
        .from("professional_certifications")
        .select("*")
        .eq("user_id", identity.userId)
        .order("issued_on", { ascending: false }),
      identity.supabase
        .from("professional_profiles")
        .select("biography, languages, photo_path")
        .eq("user_id", identity.userId)
        .single(),
      identity.supabase
        .from("professional_skills")
        .select("id", { count: "exact", head: true })
        .eq("user_id", identity.userId),
    ])

  const education = (educationResult.data ?? []) as EducationRecord[]
  const experience = (experienceResult.data ?? []) as ExperienceRecord[]
  const licenses = (licenseResult.data ?? []) as LicenseRecord[]
  const certifications = (certificationResult.data ??
    []) as CertificationRecord[]
  const completedSections = [
    education.length > 0,
    experience.length > 0,
    licenses.length > 0,
    certifications.length > 0,
    Boolean(
      extendedResult.data?.biography &&
      extendedResult.data.languages?.length &&
      extendedResult.data.photo_path,
    ),
    (skillResult.count ?? 0) > 0,
  ].filter(Boolean).length
  const completion = Math.round((completedSections / 6) * 100)
  const editingEducation = education.find(
    (record) => record.id === query.editEducation,
  )
  const editingExperience = experience.find(
    (record) => record.id === query.editExperience,
  )
  const editingLicense = licenses.find(
    (record) => record.id === query.editLicense,
  )
  const editingCertification = certifications.find(
    (record) => record.id === query.editCertification,
  )

  return (
    <ProfessionalDashboardShell active="career" email={identity.email}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Structured career record
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Career history
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Add the education, clinical experience, licenses, and credentials
            that make up your professional healthcare profile.
          </p>
        </div>
        <div className="min-w-56 rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Profile completion</span>
            <strong className="text-primary">{completion}%</strong>
          </div>
          <div
            aria-label={`${completion}% complete`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={completion}
            className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6">
        <CareerSection
          description="Degrees, medical school, residency, fellowship, and clinical training."
          form={
            <EducationForm
              record={editingEducation}
              showCancel={Boolean(query.editEducation)}
            />
          }
          icon={<GraduationCap className="size-5 text-primary" />}
          hasRecords={education.length > 0}
          title="Education and training"
        >
          {education.map((record) => (
            <CareerRecord
              editHref={`?editEducation=${record.id}`}
              key={record.id}
              recordId={record.id}
              recordType="education"
              subtitle={`${educationTypeLabels[record.education_type]} · ${dateRange(record.start_date, record.end_date, record.is_current)}`}
              title={`${record.program} — ${record.institution}`}
            />
          ))}
        </CareerSection>

        <CareerSection
          description="Clinical, operational, academic, and leadership experience."
          form={
            <ExperienceForm
              record={editingExperience}
              showCancel={Boolean(query.editExperience)}
            />
          }
          icon={<BriefcaseBusiness className="size-5 text-primary" />}
          hasRecords={experience.length > 0}
          title="Professional experience"
        >
          {experience.map((record) => (
            <CareerRecord
              editHref={`?editExperience=${record.id}`}
              key={record.id}
              recordId={record.id}
              recordType="experience"
              subtitle={`${record.organization_name} · ${dateRange(record.start_date, record.end_date, record.is_current)}`}
              title={record.role_title}
            />
          ))}
        </CareerSection>

        <CareerSection
          description="State licenses used to establish professional eligibility."
          form={
            <LicenseForm
              record={editingLicense}
              showCancel={Boolean(query.editLicense)}
            />
          }
          icon={<ShieldCheck className="size-5 text-primary" />}
          hasRecords={licenses.length > 0}
          title="Professional licenses"
        >
          {licenses.map((record) => (
            <CareerRecord
              editHref={`?editLicense=${record.id}`}
              key={record.id}
              recordId={record.id}
              recordType="license"
              subtitle={`${record.issuing_state} · License ${record.license_number}${record.expires_on ? ` · Expires ${formatDate(record.expires_on)}` : ""}`}
              title={record.license_type}
            />
          ))}
        </CareerSection>

        <CareerSection
          description="Board certifications and other recognized professional credentials."
          form={
            <CertificationForm
              record={editingCertification}
              showCancel={Boolean(query.editCertification)}
            />
          }
          icon={<Award className="size-5 text-primary" />}
          hasRecords={certifications.length > 0}
          title="Certifications"
        >
          {certifications.map((record) => (
            <CareerRecord
              editHref={`?editCertification=${record.id}`}
              key={record.id}
              recordId={record.id}
              recordType="certification"
              subtitle={`${record.issuing_organization}${record.expires_on ? ` · Expires ${formatDate(record.expires_on)}` : ""}`}
              title={record.name}
            />
          ))}
        </CareerSection>
      </div>
    </ProfessionalDashboardShell>
  )
}

function CareerSection({
  children,
  description,
  form,
  hasRecords,
  icon,
  title,
}: {
  children: ReactNode
  description: string
  form: ReactNode
  hasRecords: boolean
  icon: ReactNode
  title: string
}) {
  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          <Badge variant="secondary">Private by default</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid content-start gap-3">
          {hasRecords ? children : (
            <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              No records have been added to this section.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-muted/25 p-4">
          {form}
        </div>
      </CardContent>
    </Card>
  )
}

function CareerRecord({
  editHref,
  recordId,
  recordType,
  subtitle,
  title,
}: {
  editHref: string
  recordId: string
  recordType: string
  subtitle: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={editHref}>
            <Pencil />
            Edit
          </Link>
        </Button>
        <form action={deleteCareerRecord}>
          <input name="recordId" type="hidden" value={recordId} />
          <input name="recordType" type="hidden" value={recordType} />
          <Button size="sm" type="submit" variant="destructive">
            <Trash2 />
            Remove
          </Button>
        </form>
      </div>
    </div>
  )
}

function EducationForm({
  record,
  showCancel,
}: {
  record?: EducationRecord
  showCancel: boolean
}) {
  return (
    <RecordForm
      action={saveEducation}
      recordId={record?.id}
      showCancel={showCancel}
      submitLabel={record ? "Update education" : "Add education"}
      title={record ? "Edit education" : "Add education"}
    >
      <Select name="educationType" defaultValue={record?.education_type}>
        {educationTypes.map((type) => (
          <option key={type} value={type}>
            {educationTypeLabels[type]}
          </option>
        ))}
      </Select>
      <Input
        defaultValue={record?.institution}
        maxLength={180}
        name="institution"
        placeholder="Institution"
        required
      />
      <Input
        defaultValue={record?.program}
        maxLength={180}
        name="program"
        placeholder="Degree or program"
        required
      />
      <Input
        defaultValue={record?.specialty ?? ""}
        maxLength={120}
        name="specialty"
        placeholder="Specialty (optional)"
      />
      <LocationFields city={record?.city} stateCode={record?.state_code} />
      <Input
        defaultValue={record?.country ?? "United States"}
        maxLength={100}
        name="country"
        placeholder="Country"
        required
      />
      <DateFields
        endDate={record?.end_date}
        isCurrent={record?.is_current}
        startDate={record?.start_date}
      />
      <Textarea
        defaultValue={record?.description ?? ""}
        maxLength={1200}
        name="description"
        placeholder="Training details (optional)"
        rows={3}
      />
    </RecordForm>
  )
}

function ExperienceForm({
  record,
  showCancel,
}: {
  record?: ExperienceRecord
  showCancel: boolean
}) {
  return (
    <RecordForm
      action={saveExperience}
      recordId={record?.id}
      showCancel={showCancel}
      submitLabel={record ? "Update experience" : "Add experience"}
      title={record ? "Edit experience" : "Add experience"}
    >
      <Input
        defaultValue={record?.role_title}
        maxLength={160}
        name="roleTitle"
        placeholder="Role title"
        required
      />
      <Input
        defaultValue={record?.organization_name}
        maxLength={180}
        name="organizationName"
        placeholder="Organization"
        required
      />
      <Select
        defaultValue={record?.employment_type ?? ""}
        name="employmentType"
      >
        <option value="">Employment type (optional)</option>
        {employmentTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <LocationFields city={record?.city} stateCode={record?.state_code} />
      <DateFields
        endDate={record?.end_date}
        isCurrent={record?.is_current}
        startDate={record?.start_date}
        startRequired
      />
      <Textarea
        defaultValue={record?.description ?? ""}
        maxLength={1600}
        name="description"
        placeholder="Responsibilities and accomplishments (optional)"
        rows={3}
      />
    </RecordForm>
  )
}

function LicenseForm({
  record,
  showCancel,
}: {
  record?: LicenseRecord
  showCancel: boolean
}) {
  return (
    <RecordForm
      action={saveLicense}
      recordId={record?.id}
      showCancel={showCancel}
      submitLabel={record ? "Update license" : "Add license"}
      title={record ? "Edit license" : "Add license"}
    >
      <Input
        defaultValue={record?.license_type}
        maxLength={120}
        name="licenseType"
        placeholder="License type"
        required
      />
      <Input
        defaultValue={record?.license_number}
        maxLength={80}
        name="licenseNumber"
        placeholder="License number"
        required
      />
      <StateSelect
        defaultValue={record?.issuing_state}
        name="issuingState"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          defaultValue={record?.issued_on ?? ""}
          name="issuedOn"
          type="date"
        />
        <Input
          defaultValue={record?.expires_on ?? ""}
          name="expiresOn"
          type="date"
        />
      </div>
    </RecordForm>
  )
}

function CertificationForm({
  record,
  showCancel,
}: {
  record?: CertificationRecord
  showCancel: boolean
}) {
  return (
    <RecordForm
      action={saveCertification}
      recordId={record?.id}
      showCancel={showCancel}
      submitLabel={record ? "Update certification" : "Add certification"}
      title={record ? "Edit certification" : "Add certification"}
    >
      <Input
        defaultValue={record?.name}
        maxLength={180}
        name="name"
        placeholder="Certification name"
        required
      />
      <Input
        defaultValue={record?.issuing_organization}
        maxLength={180}
        name="issuingOrganization"
        placeholder="Issuing organization"
        required
      />
      <Input
        defaultValue={record?.credential_id ?? ""}
        maxLength={100}
        name="credentialId"
        placeholder="Credential ID (optional)"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          defaultValue={record?.issued_on ?? ""}
          name="issuedOn"
          type="date"
        />
        <Input
          defaultValue={record?.expires_on ?? ""}
          name="expiresOn"
          type="date"
        />
      </div>
    </RecordForm>
  )
}

function RecordForm({
  action,
  children,
  recordId,
  showCancel,
  submitLabel,
  title,
}: {
  action: (formData: FormData) => Promise<void>
  children: ReactNode
  recordId?: string
  showCancel: boolean
  submitLabel: string
  title: string
}) {
  return (
    <form action={action} className="grid gap-3">
      <h3 className="font-semibold">{title}</h3>
      {recordId && (
        <input name="recordId" type="hidden" value={recordId} />
      )}
      {children}
      <AuthSubmitButton pendingLabel="Saving...">
        {submitLabel}
      </AuthSubmitButton>
      {showCancel && (
        <Button asChild variant="ghost">
          <Link href="/dashboard/profile/career">Cancel editing</Link>
        </Button>
      )}
    </form>
  )
}

function LocationFields({
  city,
  stateCode,
}: {
  city?: string | null
  stateCode?: string | null
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        defaultValue={city ?? ""}
        maxLength={120}
        name="city"
        placeholder="City (optional)"
      />
      <StateSelect defaultValue={stateCode ?? ""} name="stateCode" />
    </div>
  )
}

function DateFields({
  endDate,
  isCurrent,
  startDate,
  startRequired = false,
}: {
  endDate?: string | null
  isCurrent?: boolean
  startDate?: string | null
  startRequired?: boolean
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          defaultValue={startDate ?? ""}
          name="startDate"
          required={startRequired}
          type="date"
        />
        <Input defaultValue={endDate ?? ""} name="endDate" type="date" />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input defaultChecked={isCurrent} name="isCurrent" type="checkbox" />
        This is current
      </label>
    </>
  )
}

function StateSelect({
  defaultValue = "",
  name,
  required = false,
}: {
  defaultValue?: string
  name: string
  required?: boolean
}) {
  return (
    <Select defaultValue={defaultValue} name={name} required={required}>
      <option value="">State {required ? "" : "(optional)"}</option>
      {usStates.map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </Select>
  )
}

function Select({
  children,
  defaultValue,
  name,
  required,
}: {
  children: ReactNode
  defaultValue?: string
  name: string
  required?: boolean
}) {
  return (
    <select
      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
      defaultValue={defaultValue}
      name={name}
      required={required}
    >
      {children}
    </select>
  )
}

function dateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
) {
  const start = startDate ? formatDate(startDate) : "Date not provided"
  return `${start}–${isCurrent ? "Present" : endDate ? formatDate(endDate) : "Not provided"}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}
