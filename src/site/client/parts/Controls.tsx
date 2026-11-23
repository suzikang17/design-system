import { useId, useState } from "react"

import type { ComponentMeta, Control } from "@/client/catalog/meta"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Props = Record<string, unknown>

interface ControlsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
  meta: ComponentMeta<any>
  props: Props
  onChange: (next: Props) => void
}

/** A select with this many options or fewer shows them all as toggles; more go in a menu. */
const MAX_TOGGLES = 4

/** One field per `meta.controls` entry, each reporting the whole next props object. */
export function Controls({ meta, props, onChange }: ControlsProps) {
  const entries = Object.entries(meta.controls as Record<string, Control | undefined>).filter(
    (entry): entry is [string, Control] => entry[1] !== undefined,
  )
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">This piece has no options.</p>
  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, control]) => (
        <ControlField key={key} control={control} value={props[key]} onChange={(value) => onChange({ ...props, [key]: value })} />
      ))}
    </div>
  )
}

interface FieldProps {
  control: Control
  value: unknown
  onChange: (value: unknown) => void
}

const labelClass = "text-sm font-medium text-foreground"

function ControlField({ control, value, onChange }: FieldProps) {
  const id = useId()
  const label = (
    <Label htmlFor={id} id={`${id}-label`} className={labelClass}>
      {control.label}
    </Label>
  )

  switch (control.type) {
    case "text":
      return (
        <div data-control="" className="grid content-start gap-2">
          {label}
          <Input id={id} type="text" value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
        </div>
      )
    case "boolean":
      return (
        <div data-control="" className="flex items-center gap-3 self-start pt-7">
          <Switch id={id} checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
          {label}
        </div>
      )
    case "select":
      if (control.options.length <= MAX_TOGGLES) {
        return (
          <div data-control="" className="grid content-start gap-2">
            <span id={`${id}-label`} className={labelClass}>
              {control.label}
            </span>
            <ToggleGroup
              type="single"
              aria-labelledby={`${id}-label`}
              variant="outline"
              size="sm"
              value={typeof value === "string" ? value : ""}
              // Pressing the chosen option again would clear it; a piece's option always has a value.
              onValueChange={(next) => next && onChange(next)}
              className="flex-wrap justify-start"
            >
              {control.options.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="h-10 rounded-full bg-card px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground md:h-8"
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )
      }
      return (
        <div data-control="" className="grid content-start gap-2">
          {label}
          <Select value={typeof value === "string" ? value : undefined} onValueChange={onChange}>
            <SelectTrigger id={id} aria-labelledby={`${id}-label`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {control.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    case "number": {
      const n = typeof value === "number" ? value : control.min
      return (
        <div data-control="" className="grid content-start gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span id={`${id}-label`} className={labelClass}>
              {control.label}
            </span>
            <output aria-hidden="true" className="text-sm tabular-nums text-muted-foreground">
              {n}
            </output>
          </div>
          <Slider
            aria-labelledby={`${id}-label`}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={[n]}
            onValueChange={([next]) => next !== undefined && onChange(next)}
            className="h-9"
          />
        </div>
      )
    }
    case "list":
      return (
        <div data-control="" className="grid content-start gap-2">
          {label}
          <ListInput id={id} value={value} onChange={onChange} />
          <p className="text-xs text-muted-foreground">One item per line.</p>
        </div>
      )
  }
}

const toLines = (value: unknown) => (Array.isArray(value) ? value.join("\n") : "")
const toItems = (text: string) => text.split("\n").filter((line) => line !== "")

/** Keeps the raw text while typing (so a fresh empty line survives) and reports the items without blank lines. */
function ListInput({ id, value, onChange }: { id: string; value: unknown; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState(() => toLines(value))
  // Resync when the value changes from outside (a navigation), not from this field's own typing.
  if (toLines(value) !== toItems(draft).join("\n")) setDraft(toLines(value))
  return (
    <Textarea
      id={id}
      rows={4}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value)
        onChange(toItems(event.target.value))
      }}
    />
  )
}
