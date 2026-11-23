import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")

  useEffect(() => {
    if (state === "idle") return
    const timer = setTimeout(() => setState("idle"), 2000)
    return () => clearTimeout(timer)
  }, [state])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setState("copied")
    } catch {
      setState("failed")
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={copy} aria-label={label} className="h-8 shrink-0 gap-1.5 px-2.5 text-xs">
      {state === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}</span>
    </Button>
  )
}
