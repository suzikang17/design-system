import { useState } from "react"
import { ChevronDown, Users } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { FilterPillLabel, filterPillClass } from "@/components/ui/filter-pill"
import { PILL_ITEM, PillPopoverContent } from "@/components/ui/pill-popover"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

const OWNERS = ["Alex Rivera", "Sam Chen", "Priya Patel", "Jordan Lee"]

function OwnerFilter() {
  const [owner, setOwner] = useState<string>()
  const [open, setOpen] = useState(false)
  const pick = (value?: string) => {
    setOwner(value)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={filterPillClass(Boolean(owner))}>
          <FilterPillLabel label="Owner" value={owner} icon={Users} />
          <ChevronDown aria-hidden="true" className="opacity-60" />
        </button>
      </PopoverTrigger>
      <PillPopoverContent className="w-56">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem className={PILL_ITEM} onSelect={() => pick(undefined)}>
                Anyone
              </CommandItem>
              {OWNERS.map((name) => (
                <CommandItem key={name} className={PILL_ITEM} onSelect={() => pick(name)}>
                  {name}
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
  title: "Filter Pill",
  group: "Controls",
  description:
    "A dropdown trigger that says what it filters and what it is set to, in one line. A set filter is filled; an unset one reads as part of the page.",
  examples: {
    "Unset and set": () => (
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={filterPillClass(false)}>
          <FilterPillLabel label="Status" />
          <ChevronDown aria-hidden="true" className="opacity-60" />
        </button>
        <button type="button" className={filterPillClass(true)}>
          <FilterPillLabel label="Group by" value="Owner" />
          <ChevronDown aria-hidden="true" className="opacity-60" />
        </button>
      </div>
    ),
    "Opens a list": OwnerFilter,
    "Long values truncate, labels stay whole": () => (
      <button type="button" className={filterPillClass(true, "max-w-[15rem]")}>
        <FilterPillLabel label="Project" value="Website redesign, phase two" />
        <ChevronDown aria-hidden="true" className="opacity-60" />
      </button>
    ),
  },
} satisfies Showcase
