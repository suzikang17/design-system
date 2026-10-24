import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default {
  title: "Popover",
  group: "Overlays",
  description: "A small panel anchored to the control that opened it.",
  examples: {
    "Quick settings": () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Dimensions</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3">
          <p className="text-sm font-medium">Image size</p>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label htmlFor="popover-width">Width</Label>
            <Input id="popover-width" defaultValue="1200" className="col-span-2 h-8" />
            <Label htmlFor="popover-height">Height</Label>
            <Input id="popover-height" defaultValue="630" className="col-span-2 h-8" />
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
} satisfies Showcase
