import { useState } from "react"
import { Check, ChevronDown, Plus } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { FilterPillLabel, filterPillClass } from "@/components/ui/filter-pill"
import { PILL_ITEM, PillActionItem, PillPopoverContent } from "@/components/ui/pill-popover"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

const LABELS = ["Bug", "Design", "Docs", "Performance", "Research"]

function LabelPicker() {
  const [labels, setLabels] = useState<string[]>(["Design"])
  const toggle = (label: string) =>
    setLabels((list) => (list.includes(label) ? list.filter((l) => l !== label) : [...list, label]))
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={filterPillClass(labels.length > 0)}>
          <FilterPillLabel label="Labels" value={labels.join(", ")} />
          <ChevronDown aria-hidden="true" className="opacity-60" />
        </button>
      </PopoverTrigger>
      <PillPopoverContent className="w-60">
        <Command>
          <CommandInput placeholder="Find a label" />
          <CommandList>
            <CommandEmpty>No labels match.</CommandEmpty>
            <CommandGroup heading="Labels">
              {LABELS.map((label) => (
                <CommandItem key={label} className={PILL_ITEM} onSelect={() => toggle(label)}>
                  <Check aria-hidden="true" className={labels.includes(label) ? "mr-2 size-3.5" : "mr-2 size-3.5 invisible"} />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <PillActionItem>
                <Plus aria-hidden="true" className="mr-2 size-3.5" />
                New label
              </PillActionItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PillPopoverContent>
    </Popover>
  )
}

function SortMenu() {
  const [sort, setSort] = useState("Newest")
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={filterPillClass(false)}>
          <FilterPillLabel label="Sort" value={sort} />
          <ChevronDown aria-hidden="true" className="opacity-60" />
        </button>
      </PopoverTrigger>
      <PillPopoverContent className="w-44">
        <Command>
          <CommandList>
            <CommandGroup>
              {["Newest", "Oldest", "Most active"].map((option) => (
                <CommandItem
                  key={option}
                  className={PILL_ITEM}
                  onSelect={() => {
                    setSort(option)
                    setOpen(false)
                  }}
                >
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PillPopoverContent>
    </Popover>
  )
}

export default {
  title: "Pill Popover",
  group: "Overlays",
  description:
    "The panel a pill opens: rounded, with inset rows, a hairline between sections and selection shown by a primary tint.",
  examples: {
    "Search and pick several": LabelPicker,
    "Pick one": SortMenu,
  },
} satisfies Showcase
