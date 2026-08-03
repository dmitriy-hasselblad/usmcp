export const ADMIN_DIRECTORY_PAGE_SIZE = 20

export function parseAdminPage(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function normalizeAdminQuery(value?: string) {
  return (value ?? "")
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value))
}
