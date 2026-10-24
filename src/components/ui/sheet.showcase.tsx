import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default {
  title: "Sheet",
  group: "Overlays",
  description: "A panel that slides in from an edge beside the page, behind a light scrim.",
  examples: {
    "From the right": () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Show details</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Write release notes</SheetTitle>
            <SheetDescription>Owned by Alex Rivera. Due in two days.</SheetDescription>
          </SheetHeader>
          <p className="mt-6 text-sm text-muted-foreground">Summarize what changed for people who use the product.</p>
        </SheetContent>
      </Sheet>
    ),
  },
} satisfies Showcase
