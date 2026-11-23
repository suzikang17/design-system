import { useId, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { PillButton } from "@/components/ui/pill"
import { Progress } from "@/components/ui/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { themes } from "@/themes"
import { CopyButton } from "../CopyButton"
import { useTheme } from "../theme"

const TOKENS = [
  ["Primary", "bg-primary"],
  ["Accent", "bg-accent"],
  ["Muted", "bg-muted"],
  ["Destructive", "bg-destructive"],
] as const

export function ThemeGallery() {
  const { theme: current, setTheme } = useTheme()
  return (
    <section id="themes" aria-labelledby="themes-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="max-w-2xl">
        <h2 id="themes-title" className="text-3xl font-semibold tracking-tight md:text-4xl">
          Themes
        </h2>
        <p className="mt-3 text-muted-foreground">
          A theme is one CSS file of tokens. Each card below renders the same components with a different file.
        </p>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {themes.map((theme) => {
          const inUse = theme.id === current.id
          return (
            <li
              key={theme.id}
              data-theme={theme.id}
              className={cn(
                "flex flex-col gap-4 rounded-2xl border bg-background p-4 text-foreground md:p-5",
                theme.dark ? "dark" : "light",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">{theme.label}</h3>
                <ul aria-label={`${theme.label} colors`} className="flex -space-x-1">
                  {TOKENS.map(([name, swatch]) => (
                    <li key={name} title={name} className={cn("size-5 rounded-full border-2 border-background", swatch)}>
                      <span className="sr-only">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Composition />
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <PillButton variant={inUse ? "secondary" : "outline"} disabled={inUse} onClick={() => setTheme(theme.id)}>
                  {inUse ? "In use on this site" : `Use ${theme.label}`}
                </PillButton>
                <CopyButton
                  value={`pnpm dlx shadcn@latest add ${window.location.origin}/r/${theme.id}.json`}
                  label={`Copy the install command for ${theme.label}`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** The same small screen in every theme. */
function Composition() {
  const id = useId()
  const [period, setPeriod] = useState("week")
  const [summary, setSummary] = useState(true)
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">Weekly review</p>
          <p className="text-sm text-muted-foreground">8 of 12 tasks done</p>
        </div>
        <Badge variant="secondary">On track</Badge>
      </div>
      <Progress value={67} aria-label="Tasks done" className="h-2" />
      <SegmentedControl value={period} onValueChange={setPeriod} aria-label="Period">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-foreground">
          Email me a summary
        </Label>
        <Switch id={id} checked={summary} onCheckedChange={setSummary} />
      </div>
      <div className="flex flex-wrap gap-2">
        <PillButton>Approve</PillButton>
        <PillButton variant="outline">Later</PillButton>
      </div>
    </div>
  )
}
