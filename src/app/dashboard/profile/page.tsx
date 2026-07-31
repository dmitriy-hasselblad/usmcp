import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  CheckCircle2,
  Download,
  FileBadge,
  FileText,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
} from "lucide-react"
import { redirect } from "next/navigation"

import {
  deleteProfessionalDocument,
  deleteProfessionalSkill,
  removeProfessionalPhoto,
  saveProfessionalSkill,
  setPrimaryResume,
  updateProfessionalProfile,
} from "@/app/dashboard/profile/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { DocumentUploadForm } from "@/components/professional/document-upload-form"
import { ProfessionalPhotoForm } from "@/components/professional/professional-photo-form"
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
import {
  careerStages,
  professions,
  usStates,
} from "@/lib/auth/validation"
import {
  professionalDocumentTypeLabels,
  profileVisibilities,
  skillProficiencies,
  type ProfessionalDocumentRecord,
  type ProfessionalProfileRecord,
  type ProfessionalSkillRecord,
} from "@/lib/professional/constants"

export const metadata: Metadata = {
  title: "Professional profile",
  description: "Manage your USHCE professional profile and private documents.",
}

type SearchParams = Promise<{
  error?: string | string[]
  success?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProfessionalProfilePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [identity, query] = await Promise.all([
    requireIdentity("/dashboard/profile"),
    searchParams,
  ])

  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, first_name, last_name, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type !== "professional") {
    redirect("/dashboard/organization")
  }

  const [
    { data: professionalProfileData },
    { data: documentData },
    { data: applicationData },
    { data: skillData },
  ] = await Promise.all([
    identity.supabase
      .from("professional_profiles")
      .select("*")
      .eq("user_id", identity.userId)
      .single(),
    identity.supabase
      .from("professional_documents")
      .select("*")
      .eq("user_id", identity.userId)
      .order("created_at", { ascending: false }),
    identity.supabase
      .from("applications")
      .select("resume_document_id")
      .eq("candidate_id", identity.userId)
      .not("resume_document_id", "is", null),
    identity.supabase
      .from("professional_skills")
      .select("*")
      .eq("user_id", identity.userId)
      .order("name"),
  ])

  if (!professionalProfileData) {
    redirect("/onboarding")
  }

  const professionalProfile =
    professionalProfileData as ProfessionalProfileRecord
  const documents = (documentData ?? []) as ProfessionalDocumentRecord[]
  const skills = (skillData ?? []) as ProfessionalSkillRecord[]
  const attachedDocumentIds = new Set(
    (applicationData ?? [])
      .map((application) => application.resume_document_id)
      .filter((id): id is string => typeof id === "string"),
  )
  const hasPrimaryResume = documents.some(
    (document) => document.document_type === "resume" && document.is_primary,
  )

  return (
    <ProfessionalDashboardShell active="profile" email={identity.email}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Career identity
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Professional profile
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Keep your career information current and manage the private
            documents you use in applications.
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-800" variant="secondary">
          <ShieldCheck />
          Private by default
        </Badge>
      </div>

      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
        <Card className="bg-white">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="size-5 text-primary" />
              Profile information
            </CardTitle>
            <CardDescription>
              These details are used to prepare future applications and career
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={updateProfessionalProfile} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First name">
                  <Input
                    className="h-11"
                    defaultValue={profile.first_name ?? ""}
                    maxLength={80}
                    minLength={2}
                    name="firstName"
                    required
                  />
                </Field>
                <Field label="Last name">
                  <Input
                    className="h-11"
                    defaultValue={profile.last_name ?? ""}
                    maxLength={80}
                    minLength={2}
                    name="lastName"
                    required
                  />
                </Field>
              </div>

              <Field label="Professional headline">
                <Input
                  className="h-11"
                  defaultValue={professionalProfile.headline ?? ""}
                  maxLength={160}
                  name="headline"
                  placeholder="Board-certified physician focused on..."
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  defaultValue={professionalProfile.profession}
                  label="Profession"
                  name="profession"
                  options={professions.map((value) => [value, value] as const)}
                />
                <Field label="Specialty">
                  <Input
                    className="h-11"
                    defaultValue={professionalProfile.specialty ?? ""}
                    maxLength={120}
                    name="specialty"
                    placeholder="Cardiology"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  defaultValue={professionalProfile.career_stage}
                  label="Career stage"
                  name="careerStage"
                  options={careerStages.map(
                    (value) => [value, value] as const,
                  )}
                />
                <Field label="Years of experience">
                  <Input
                    className="h-11"
                    defaultValue={
                      professionalProfile.years_experience ?? undefined
                    }
                    max={70}
                    min={0}
                    name="yearsExperience"
                    type="number"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="City">
                  <Input
                    className="h-11"
                    defaultValue={professionalProfile.city ?? ""}
                    maxLength={120}
                    name="city"
                    placeholder="Chicago"
                  />
                </Field>
                <SelectField
                  defaultValue={professionalProfile.state_code}
                  label="State"
                  name="stateCode"
                  options={usStates.map(
                    ([code, label]) => [code, label] as const,
                  )}
                />
              </div>

              <Field label="Phone number">
                <Input
                  autoComplete="tel"
                  className="h-11"
                  defaultValue={professionalProfile.phone ?? ""}
                  maxLength={30}
                  name="phone"
                  placeholder="+1 (312) 555-0147"
                  type="tel"
                />
              </Field>

              <Field label="Professional summary">
                <Textarea
                  defaultValue={professionalProfile.biography ?? ""}
                  maxLength={2000}
                  name="biography"
                  placeholder="Describe your clinical background, areas of focus, and career goals."
                  rows={8}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Up to 2,000 characters.
                </span>
              </Field>

              <Field label="Languages">
                <Input
                  className="h-11"
                  defaultValue={professionalProfile.languages.join(", ")}
                  maxLength={720}
                  name="languages"
                  placeholder="English, Spanish"
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Separate up to 12 languages with commas.
                </span>
              </Field>

              <SelectField
                defaultValue={professionalProfile.profile_visibility}
                label="Extended profile visibility"
                name="profileVisibility"
                options={profileVisibilities.map((value) => [
                  value,
                  value === "application_only"
                    ? "Organizations I apply to"
                    : "Private to me",
                ] as const)}
              />

              <AuthSubmitButton pendingLabel="Saving profile...">
                Save profile
              </AuthSubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileBadge className="size-5 text-primary" />
              Upload a document
            </CardTitle>
            <CardDescription>
              Add resumes, licenses, and certifications to your private career
              record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm
              hasPrimaryResume={hasPrimaryResume}
              userId={identity.userId}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Professional photo</CardTitle>
            <CardDescription>Optional and private by default.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {professionalProfile.photo_path && (
              <div className="flex items-center gap-4">
                <Image
                  alt={`${profile.first_name ?? "Professional"} profile photo`}
                  className="size-24 rounded-2xl object-cover"
                  height={96}
                  src={`/dashboard/profile/photo/${identity.userId}`}
                  unoptimized
                  width={96}
                />
                <form action={removeProfessionalPhoto}>
                  <Button type="submit" variant="outline">Remove photo</Button>
                </form>
              </div>
            )}
            <ProfessionalPhotoForm userId={identity.userId} />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Structured skills</CardTitle>
            <CardDescription>Add, edit, or remove healthcare skills.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form action={saveProfessionalSkill} className="grid gap-3 sm:grid-cols-2">
              <Input maxLength={80} minLength={2} name="name" placeholder="Patient assessment" required />
              <select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="proficient" name="proficiency">
                {skillProficiencies.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <Input max={70} min={0} name="yearsExperience" placeholder="Years" type="number" />
              <Button type="submit">Add skill</Button>
            </form>
            {skills.map((skill) => (
              <form action={saveProfessionalSkill} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_10rem_6rem_auto_auto]" key={skill.id}>
                <input name="skillId" type="hidden" value={skill.id} />
                <Input defaultValue={skill.name} maxLength={80} minLength={2} name="name" required />
                <select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={skill.proficiency} name="proficiency">
                  {skillProficiencies.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <Input defaultValue={skill.years_experience ?? undefined} max={70} min={0} name="yearsExperience" type="number" />
                <Button type="submit" variant="outline">Save</Button>
                <Button formAction={deleteProfessionalSkill} type="submit" variant="destructive">Remove</Button>
              </form>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="size-5 text-primary" />
            Private documents
          </CardTitle>
          <CardDescription>
            Resumes can be attached to applications. Licenses and
            certifications remain visible only to you in this stage.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {documents.length ? (
            <div className="grid gap-4">
              {documents.map((document) => {
                const attached = attachedDocumentIds.has(document.id)

                return (
                  <div
                    className="grid gap-5 rounded-xl border border-border p-4 lg:grid-cols-[1fr_auto] lg:items-center"
                    key={document.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{document.title}</h2>
                        <Badge variant="secondary">
                          {
                            professionalDocumentTypeLabels[
                              document.document_type
                            ]
                          }
                        </Badge>
                        {document.is_primary && (
                          <Badge
                            className="bg-blue-50 text-primary"
                            variant="secondary"
                          >
                            <Star />
                            Primary
                          </Badge>
                        )}
                        {attached && (
                          <Badge
                            className="bg-emerald-50 text-emerald-800"
                            variant="secondary"
                          >
                            <CheckCircle2 />
                            Attached to application
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm text-muted-foreground">
                        {document.file_name} ·{" "}
                        {formatFileSize(document.file_size)}
                        {" · "}
                        Uploaded {formatDate(document.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button asChild variant="outline">
                        <Link
                          href={`/dashboard/documents/${document.id}/download`}
                        >
                          <Download />
                          Download
                        </Link>
                      </Button>
                      {document.document_type === "resume" &&
                        !document.is_primary && (
                          <form action={setPrimaryResume}>
                            <input
                              name="documentId"
                              type="hidden"
                              value={document.id}
                            />
                            <Button type="submit" variant="outline">
                              <Star />
                              Make primary
                            </Button>
                          </form>
                        )}
                      {!attached && (
                        <form action={deleteProfessionalDocument}>
                          <input
                            name="documentId"
                            type="hidden"
                            value={document.id}
                          />
                          <Button type="submit" variant="destructive">
                            <Trash2 />
                            Remove
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary">
                <FileText className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">
                No private documents yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Upload a resume to make future applications faster, then add
                licenses or certifications as your profile grows.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ProfessionalDashboardShell>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string
  label: string
  name: string
  options: readonly (readonly [string, string])[]
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function formatFileSize(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
