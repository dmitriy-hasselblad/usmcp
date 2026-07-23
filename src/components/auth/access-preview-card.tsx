import Link from "next/link"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type AccessPreviewCardProps = {
  mode: "sign-in" | "sign-up"
}

export function AccessPreviewCard({ mode }: AccessPreviewCardProps) {
  const isSignIn = mode === "sign-in"

  return (
    <Card className="w-full max-w-md border-border/80 bg-white shadow-[0_24px_60px_rgba(15,76,129,0.12)]">
      <CardHeader className="pb-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
          <LockKeyhole className="size-5" />
        </span>
        <CardTitle className="pt-4 text-2xl tracking-[-0.04em]">
          {isSignIn ? "Sign in to USHCE" : "Create your USHCE account"}
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          {isSignIn
            ? "Account access is not live in this product preview."
            : "Registration will open after secure authentication and profile storage are connected."}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <Input
            autoComplete="email"
            disabled
            placeholder="you@example.com"
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <Input
            autoComplete={isSignIn ? "current-password" : "new-password"}
            disabled
            placeholder="Enter your password"
            type="password"
          />
        </label>
        <Button className="mt-1 h-11 rounded-xl" disabled>
          {isSignIn ? "Sign in" : "Create account"}
        </Button>
        <p className="rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
          Preview only: no personal information is collected or stored on this
          page.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {isSignIn ? "New to USHCE?" : "Already have an account?"}{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            href={isSignIn ? "/sign-up" : "/sign-in"}
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
