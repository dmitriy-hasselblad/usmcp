"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

type AuthSubmitButtonProps = {
  children: ReactNode
  disabled?: boolean
  pendingLabel: string
}

export function AuthSubmitButton({
  children,
  disabled = false,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      aria-disabled={disabled || pending}
      className="mt-2 h-11 rounded-xl"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </Button>
  )
}
