import { Button } from "@/components/ui/button"

export default function AccountSuspendedPage() {
  return <main className="grid min-h-dvh place-items-center bg-muted/35 px-5"><section className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Account access</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Your account is suspended</h1><p className="mt-4 leading-7 text-muted-foreground">Your access to protected SM VIA features has been temporarily disabled. Contact SM VIA support if you believe this decision should be reviewed.</p><form action="/auth/sign-out" className="mt-7" method="post"><Button type="submit" variant="outline">Sign out</Button></form></section></main>
}
