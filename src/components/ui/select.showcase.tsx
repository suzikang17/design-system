import type { Showcase } from "@/catalog/types"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export default {
  title: "Select",
  group: "Inputs",
  description: "A button that opens a list of options and shows the one chosen.",
  examples: {
    "Grouped options": () => (
      <Select>
        <SelectTrigger className="w-56" aria-label="Time zone">
          <SelectValue placeholder="Time zone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="new-york">New York</SelectItem>
            <SelectItem value="chicago">Chicago</SelectItem>
            <SelectItem value="los-angeles">Los Angeles</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="london">London</SelectItem>
            <SelectItem value="berlin">Berlin</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
  },
} satisfies Showcase
