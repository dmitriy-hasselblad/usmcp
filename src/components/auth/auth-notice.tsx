type AuthNoticeProps = {
  error?: string
  success?: string
}

export function AuthNotice({ error, success }: AuthNoticeProps) {
  if (!error && !success) {
    return null
  }

  return (
    <p
      aria-live="polite"
      className={
        error
          ? "rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
          : "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
      }
      role={error ? "alert" : "status"}
    >
      {error ?? success}
    </p>
  )
}
