import { CalendarDays, FileText, Settings, User } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export default {
  title: "Command",
  group: "Navigation",
  description: "A searchable list of commands and places, for a command palette or a combobox.",
  examples: {
    "Command palette": () => (
      <Command className="w-full max-w-sm rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem>
              <CalendarDays className="mr-2 size-4" /> Calendar
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 size-4" /> Documents
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 size-4" /> Profile <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 size-4" /> Preferences <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },
} satisfies Showcase
