import { ChevronsUpDown } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default {
  title: "Collapsible",
  group: "Layout",
  description: "A section that shows or hides its content when its trigger is pressed.",
  examples: {
    "Show more": () => (
      <Collapsible className="w-full max-w-xs space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">3 people have access</p>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Show everyone">
              <ChevronsUpDown />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border bg-card px-4 py-2 text-sm">Alex Rivera</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border bg-card px-4 py-2 text-sm">Sam Chen</div>
          <div className="rounded-md border bg-card px-4 py-2 text-sm">Priya Patel</div>
        </CollapsibleContent>
      </Collapsible>
    ),
  },
} satisfies Showcase
