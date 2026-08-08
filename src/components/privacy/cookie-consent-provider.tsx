"use client"

import * as React from "react"
import Link from "next/link"
import { Cookie, LockKeyhole, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  createCookiePreferences,
  defaultOptionalCookiePreferences,
  persistCookiePreferences,
  readCookiePreferences,
  type CookiePreferences,
  type OptionalCookiePreferences,
} from "@/lib/privacy/cookie-consent"
import { cn } from "@/lib/utils"

type NavigatorWithGlobalPrivacyControl = Navigator & {
  globalPrivacyControl?: boolean
}

type CookieConsentContextValue = {
  preferences: CookiePreferences | null
  globalPrivacyControlEnabled: boolean
  openPreferences: () => void
}

const CookieConsentContext =
  React.createContext<CookieConsentContextValue | null>(null)

export function useCookieConsent() {
  const context = React.useContext(CookieConsentContext)

  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider."
    )
  }

  return context
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferences, setPreferences] =
    React.useState<CookiePreferences | null>(null)
  const [isReady, setIsReady] = React.useState(false)
  const [isBannerOpen, setIsBannerOpen] = React.useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false)
  const [globalPrivacyControlEnabled, setGlobalPrivacyControlEnabled] =
    React.useState(false)

  React.useEffect(() => {
    const globalPrivacyControl =
      (navigator as NavigatorWithGlobalPrivacyControl).globalPrivacyControl ===
      true
    const storedPreferences = readCookiePreferences(document.cookie)

    setGlobalPrivacyControlEnabled(globalPrivacyControl)

    if (
      storedPreferences &&
      globalPrivacyControl &&
      storedPreferences.advertising
    ) {
      const updatedPreferences = createCookiePreferences(
        {
          functional: storedPreferences.functional,
          analytics: storedPreferences.analytics,
          advertising: false,
        },
        "gpc"
      )

      persistCookiePreferences(updatedPreferences)
      setPreferences(updatedPreferences)
    } else {
      setPreferences(storedPreferences)
    }

    setIsBannerOpen(!storedPreferences)
    setIsReady(true)
  }, [])

  const savePreferences = React.useCallback(
    (
      optionalPreferences: OptionalCookiePreferences,
      source: "banner" | "preferences"
    ) => {
      const updatedPreferences = createCookiePreferences(
        {
          ...optionalPreferences,
          advertising: globalPrivacyControlEnabled
            ? false
            : optionalPreferences.advertising,
        },
        source
      )

      persistCookiePreferences(updatedPreferences)
      setPreferences(updatedPreferences)
      setIsBannerOpen(false)
      setIsPreferencesOpen(false)
    },
    [globalPrivacyControlEnabled]
  )

  const rejectNonEssential = React.useCallback(() => {
    savePreferences(defaultOptionalCookiePreferences, "banner")
  }, [savePreferences])

  const acceptAll = React.useCallback(() => {
    savePreferences(
      {
        functional: true,
        analytics: true,
        advertising: true,
      },
      "banner"
    )
  }, [savePreferences])

  const contextValue = React.useMemo(
    () => ({
      preferences,
      globalPrivacyControlEnabled,
      openPreferences: () => setIsPreferencesOpen(true),
    }),
    [globalPrivacyControlEnabled, preferences]
  )

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {isReady && isBannerOpen && (
        <CookieConsentBanner
          globalPrivacyControlEnabled={globalPrivacyControlEnabled}
          onAcceptAll={acceptAll}
          onCustomize={() => setIsPreferencesOpen(true)}
          onRejectNonEssential={rejectNonEssential}
        />
      )}
      {isPreferencesOpen ? (
        <CookiePreferencesSheet
          globalPrivacyControlEnabled={globalPrivacyControlEnabled}
          onOpenChange={setIsPreferencesOpen}
          onRejectNonEssential={() =>
            savePreferences(defaultOptionalCookiePreferences, "preferences")
          }
          onSave={(nextPreferences) =>
            savePreferences(nextPreferences, "preferences")
          }
          preferences={preferences}
        />
      ) : null}
    </CookieConsentContext.Provider>
  )
}

function CookieConsentBanner({
  globalPrivacyControlEnabled,
  onAcceptAll,
  onCustomize,
  onRejectNonEssential,
}: {
  globalPrivacyControlEnabled: boolean
  onAcceptAll: () => void
  onCustomize: () => void
  onRejectNonEssential: () => void
}) {
  return (
    <section
      aria-label="Cookie choices"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-6xl rounded-2xl border border-primary/15 bg-white/98 p-5 shadow-[0_22px_70px_rgba(15,40,65,0.22)] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex gap-4">
          <span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary sm:grid">
            <Cookie className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.035em]">
              Your privacy choices
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              We use essential cookies to keep USHCE secure and enable account
              features. With your permission, we may also use optional cookies
              to understand site usage and improve your experience.{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/cookies"
              >
                Cookie Notice
              </Link>
            </p>
            {globalPrivacyControlEnabled && (
              <p className="mt-2 flex items-center gap-2 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                Global Privacy Control detected. Advertising and data-sharing
                cookies will remain off.
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:flex">
          <Button
            className="h-10 rounded-xl px-4"
            onClick={onRejectNonEssential}
            variant="outline"
          >
            Reject non-essential
          </Button>
          <Button
            className="h-10 rounded-xl px-4"
            onClick={onCustomize}
            variant="outline"
          >
            <SlidersHorizontal />
            Customize
          </Button>
          <Button className="h-10 rounded-xl px-4" onClick={onAcceptAll}>
            {globalPrivacyControlEnabled ? "Accept allowed" : "Accept all"}
          </Button>
        </div>
      </div>
    </section>
  )
}

function CookiePreferencesSheet({
  globalPrivacyControlEnabled,
  onOpenChange,
  onRejectNonEssential,
  onSave,
  preferences,
}: {
  globalPrivacyControlEnabled: boolean
  onOpenChange: (open: boolean) => void
  onRejectNonEssential: () => void
  onSave: (preferences: OptionalCookiePreferences) => void
  preferences: CookiePreferences | null
}) {
  const [draft, setDraft] = React.useState<OptionalCookiePreferences>(() =>
    preferences
      ? {
          functional: preferences.functional,
          analytics: preferences.analytics,
          advertising: preferences.advertising,
        }
      : defaultOptionalCookiePreferences
  )

  return (
    <Sheet onOpenChange={onOpenChange} open>
      <SheetContent
        className="w-[min(32rem,94vw)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
        side="right"
      >
        <SheetHeader className="border-b border-border px-6 py-6 pr-14">
          <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">
            <SlidersHorizontal className="size-5" />
          </div>
          <SheetTitle className="text-left text-xl font-semibold tracking-[-0.04em]">
            Cookie preferences
          </SheetTitle>
          <SheetDescription className="pt-2 text-left leading-6">
            Choose which optional cookies USHCE may use. Essential cookies
            remain active because they provide security and account access.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 px-6 py-6">
          <PreferenceRow
            checked
            description="Required for secure sign-in, session management, privacy settings, and core site operation."
            disabled
            icon={<LockKeyhole className="size-4" />}
            label="Essential"
            status="Always active"
          />
          <PreferenceRow
            checked={draft.functional}
            description="Remembers optional interface choices and provides enhanced site features."
            label="Functional"
            onChange={(checked) =>
              setDraft((current) => ({ ...current, functional: checked }))
            }
          />
          <PreferenceRow
            checked={draft.analytics}
            description="Helps us understand site usage and performance through privacy-conscious Vercel Web Analytics."
            label="Analytics"
            onChange={(checked) =>
              setDraft((current) => ({ ...current, analytics: checked }))
            }
          />
          <PreferenceRow
            checked={draft.advertising && !globalPrivacyControlEnabled}
            description={
              globalPrivacyControlEnabled
                ? "Disabled because your browser sent a Global Privacy Control signal."
                : "Would support targeted advertising or cross-context data sharing. USHCE does not currently use these cookies."
            }
            disabled={globalPrivacyControlEnabled}
            label="Advertising and targeting"
            onChange={(checked) =>
              setDraft((current) => ({ ...current, advertising: checked }))
            }
            status={globalPrivacyControlEnabled ? "GPC opt-out" : undefined}
          />

          <p className="pt-2 text-xs leading-5 text-muted-foreground">
            Learn more in our{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/cookies"
              onClick={() => onOpenChange(false)}
            >
              Cookie Notice
            </Link>{" "}
            and{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/privacy"
              onClick={() => onOpenChange(false)}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <SheetFooter className="sticky bottom-0 mt-auto gap-2 border-t border-border bg-white/95 px-6 py-5 backdrop-blur sm:flex-row">
          <Button
            className="h-10 rounded-xl px-4 sm:flex-1"
            onClick={onRejectNonEssential}
            variant="outline"
          >
            Reject non-essential
          </Button>
          <Button
            className="h-10 rounded-xl px-4 sm:flex-1"
            onClick={() => onSave(draft)}
          >
            Save choices
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function PreferenceRow({
  checked,
  description,
  disabled = false,
  icon,
  label,
  onChange,
  status,
}: {
  checked: boolean
  description: string
  disabled?: boolean
  icon?: React.ReactNode
  label: string
  onChange?: (checked: boolean) => void
  status?: string
}) {
  return (
    <label
      className={cn(
        "flex gap-4 rounded-2xl border border-border bg-white p-4",
        disabled && "cursor-default bg-muted/35"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {label}
          {status && (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary uppercase">
              {status}
            </span>
          )}
        </span>
        <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
        <input
          aria-label={`${label} cookies`}
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          type="checkbox"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40 peer-disabled:opacity-70" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
