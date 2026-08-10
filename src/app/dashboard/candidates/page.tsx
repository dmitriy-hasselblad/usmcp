import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  Bookmark,
  BookmarkCheck,
  Languages,
  MapPin,
  Search,
  Stethoscope,
  UserSearch,
} from "lucide-react"

import {
  removeSavedCandidate,
  saveCandidate,
} from "@/app/dashboard/candidates/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { EmployerPageHeader } from "@/components/employer/employer-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usStates } from "@/lib/auth/validation"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import { healthcareProfessions, isHealthcareProfession } from "@/lib/healthcare-taxonomy"

export const metadata: Metadata = {
  title: "Candidate search",
  description: "Discover healthcare professionals who opted into employer search.",
}

type SearchParams = Promise<{
  error?: string | string[]
  page?: string | string[]
  profession?: string | string[]
  q?: string | string[]
  saved?: string | string[]
  state?: string | string[]
  success?: string | string[]
}>

type CandidateDirectoryRecord = {
  user_id: string
  first_name: string | null
  last_name: string | null
  headline: string | null
  profession: string
  specialty: string | null
  state_code: string
  city: string | null
  career_stage: string
  years_experience: number | null
  languages: string[]
  biography: string | null
  photo_path: string | null
  is_saved: boolean
  total_count: number
}

const pageSize = 24

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function CandidateSearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [workspace, params] = await Promise.all([
    requireEmployerWorkspace("/dashboard/candidates"),
    searchParams,
  ])
  const query = firstValue(params.q)?.trim().slice(0, 120) ?? ""
  const profession = firstValue(params.profession) ?? ""
  const state = firstValue(params.state) ?? ""
  const savedOnly = firstValue(params.saved) === "true"
  const requestedPage = Number(firstValue(params.page) ?? "1")
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1

  const { data, error } = await workspace.supabase.rpc(
    "search_candidate_directory",
    {
      target_organization_id: workspace.organization.id,
      search_text: query || null,
      profession_filter: isHealthcareProfession(profession)
        ? profession
        : null,
      state_filter: usStates.some(([code]) => code === state) ? state : null,
      saved_only: savedOnly,
      result_limit: pageSize,
      result_offset: (page - 1) * pageSize,
    },
  )
  const candidates = (data ?? []) as CandidateDirectoryRecord[]
  const totalCount = candidates[0]?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <EmployerDashboardShell
      active="candidates"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <EmployerPageHeader
        description="Discover healthcare professionals who chose to be visible to employer workspaces. Private contact details and documents are never shown here."
        eyebrow="Talent discovery"
        title="Candidate search"
      />

      <div className="mt-7">
        <AuthNotice
          error={firstValue(params.error)}
          success={firstValue(params.success)}
        />
      </div>

      <Card className="mt-6 bg-white">
        <CardContent className="p-5">
          <form className="grid gap-4 lg:grid-cols-[minmax(15rem,1fr)_15rem_11rem_auto]">
            <label className="grid gap-2 text-sm font-medium">
              Search candidates
              <div className="relative">
                <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
                <Input
                  className="h-11 pl-9"
                  defaultValue={query}
                  maxLength={120}
                  name="q"
                  placeholder="Name, specialty, city, or headline"
                />
              </div>
            </label>
            <FilterSelect
              defaultValue={profession}
              label="Profession"
              name="profession"
              options={healthcareProfessions.map((value) => [value, value] as const)}
            />
            <FilterSelect
              defaultValue={state}
              label="State"
              name="state"
              options={usStates}
            />
            <div className="flex items-end gap-2">
              {savedOnly && <input name="saved" type="hidden" value="true" />}
              <Button className="h-11" type="submit">Apply filters</Button>
              <Button asChild className="h-11" variant="outline">
                <Link href="/dashboard/candidates">Clear</Link>
              </Button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
            <Button asChild size="sm" variant={savedOnly ? "outline" : "default"}>
              <Link href={filterHref({ profession, query, state })}>All candidates</Link>
            </Button>
            <Button asChild size="sm" variant={savedOnly ? "default" : "outline"}>
              <Link href={filterHref({ profession, query, saved: true, state })}>
                <BookmarkCheck /> Saved candidates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <DirectoryState
          description="Candidate search is temporarily unavailable. Please try again."
          title="We could not load candidates"
        />
      ) : candidates.length ? (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "professional" : "professionals"}
            </p>
            {savedOnly && (
              <Badge variant="secondary"><BookmarkCheck /> Saved by your organization</Badge>
            )}
          </div>
          <div className="mt-4 grid gap-5 xl:grid-cols-2">
            {candidates.map((candidate) => (
              <CandidateCard candidate={candidate} key={candidate.user_id} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-7 flex items-center justify-between gap-4">
              <Button asChild={page > 1} disabled={page <= 1} variant="outline">
                {page > 1 ? (
                  <Link href={filterHref({ page: page - 1, profession, query, saved: savedOnly, state })}>Previous</Link>
                ) : <span>Previous</span>}
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button asChild={page < totalPages} disabled={page >= totalPages} variant="outline">
                {page < totalPages ? (
                  <Link href={filterHref({ page: page + 1, profession, query, saved: savedOnly, state })}>Next</Link>
                ) : <span>Next</span>}
              </Button>
            </div>
          )}
        </>
      ) : (
        <DirectoryState
          description={savedOnly
            ? "Save discoverable profiles to build a shared shortlist for your organization."
            : "Try broader filters, or check again as more professionals opt into employer search."}
          title={savedOnly ? "No saved candidates yet" : "No candidates match these filters"}
        />
      )}
    </EmployerDashboardShell>
  )
}

function CandidateCard({ candidate }: { candidate: CandidateDirectoryRecord }) {
  const displayName = [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") || "Healthcare professional"

  return (
    <Card className="bg-white">
      <CardContent className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
        <div className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-primary/8 text-primary">
          {candidate.photo_path ? (
            <Image
              alt={`${displayName} profile photo`}
              className="size-20 object-cover"
              height={80}
              src={`/dashboard/profile/photo/${candidate.user_id}`}
              unoptimized
              width={80}
            />
          ) : <UserSearch className="size-8" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{displayName}</h2>
              <p className="mt-1 text-sm font-medium text-primary">
                {candidate.headline || [candidate.profession, candidate.specialty].filter(Boolean).join(" · ")}
              </p>
            </div>
            <form action={candidate.is_saved ? removeSavedCandidate : saveCandidate}>
              <input name="candidateId" type="hidden" value={candidate.user_id} />
              <Button size="sm" type="submit" variant={candidate.is_saved ? "outline" : "default"}>
                {candidate.is_saved ? <BookmarkCheck /> : <Bookmark />}
                {candidate.is_saved ? "Saved" : "Save"}
              </Button>
            </form>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Stethoscope className="size-4" />{candidate.profession}{candidate.specialty ? ` · ${candidate.specialty}` : ""}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" />{[candidate.city, candidate.state_code].filter(Boolean).join(", ")}</span>
            {candidate.languages.length > 0 && <span className="flex items-center gap-1.5"><Languages className="size-4" />{candidate.languages.slice(0, 3).join(", ")}</span>}
          </div>
          {candidate.biography && <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{candidate.biography}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{candidate.career_stage}</Badge>
            {candidate.years_experience !== null && <Badge variant="secondary">{candidate.years_experience} years experience</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DirectoryState({ description, title }: { description: string; title: string }) {
  return (
    <Card className="mt-6 bg-white">
      <CardContent className="grid place-items-center px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary"><UserSearch className="size-6" /></span>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function FilterSelect({ defaultValue, label, name, options }: { defaultValue: string; label: string; name: string; options: readonly (readonly [string, string])[] }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={defaultValue} name={name}>
        <option value="">All</option>
        {options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}
      </select>
    </label>
  )
}

function filterHref({ page, profession, query, saved, state }: { page?: number; profession?: string; query?: string; saved?: boolean; state?: string }) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (profession) params.set("profession", profession)
  if (state) params.set("state", state)
  if (saved) params.set("saved", "true")
  if (page && page > 1) params.set("page", String(page))
  const suffix = params.toString()
  return `/dashboard/candidates${suffix ? `?${suffix}` : ""}`
}
