import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { Slider } from "@/components/ui/slider"

function Volume() {
  const [value, setValue] = useState([60])
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="flex justify-between text-sm">
        <span id="slider-volume" className="font-medium">
          Volume
        </span>
        <span className="tabular-nums text-muted-foreground">{value[0]}%</span>
      </div>
      <Slider value={value} onValueChange={setValue} max={100} step={5} aria-labelledby="slider-volume" />
    </div>
  )
}

export default {
  title: "Slider",
  group: "Controls",
  description: "A handle dragged along a track to pick a value from a range.",
  examples: { Volume },
} satisfies Showcase
