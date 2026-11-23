import { Mail } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"

export default {
  title: "Button",
  group: "Controls",
  description: "The base button, in six variants and five sizes, including a 48px touch size.",
  examples: {
    "Variants and sizes": () => (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button>Save</Button>
          <Button variant="secondary">Duplicate</Button>
          <Button variant="outline">Export</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="link">Learn more</Button>
          <Button variant="destructive">Delete</Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="touch">Touch</Button>
          <Button size="icon" variant="outline" aria-label="Email">
            <Mail />
          </Button>
        </div>
      </div>
    ),
  },
} satisfies Showcase
