import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default {
  title: "Dropdown Menu",
  group: "Overlays",
  description: "A menu of actions and options that opens from a button.",
  examples: {
    "Account menu": () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Alex Rivera</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Signed in as alex@example.com</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Email updates</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
} satisfies Showcase
