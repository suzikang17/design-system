import { useState } from "react"
import { AtSign } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { PillInput } from "@/components/ui/pill-input"

function Search() {
  const [value, setValue] = useState("design tokens")
  return (
    <PillInput
      aria-label="Search"
      placeholder="Search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClear={() => setValue("")}
      containerClassName="w-full max-w-xs"
    />
  )
}

function OtherIcon() {
  const [value, setValue] = useState("")
  return (
    <PillInput
      aria-label="Invite by email"
      placeholder="name@example.com"
      type="email"
      icon={AtSign}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClear={() => setValue("")}
      clearLabel="Clear email"
      containerClassName="w-full max-w-xs"
    />
  )
}

function NoClear() {
  const [value, setValue] = useState("")
  return (
    <PillInput
      aria-label="Filter rows"
      placeholder="Filter rows"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      containerClassName="w-full max-w-[14rem]"
    />
  )
}

export default {
  title: "Pill Input",
  group: "Inputs",
  description:
    "A search field drawn as a pill, with a leading icon and a clear button that appears once there is something to clear.",
  examples: {
    "Search with clear": Search,
    "Another icon": OtherIcon,
    "Without a clear button": NoClear,
  },
} satisfies Showcase
