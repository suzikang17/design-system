import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"

/** The sheet covers its frame here; in an app it covers the screen. */
const FRAME = "flex min-h-[22rem] w-full items-center justify-center"

function Dismissible() {
  const [open, setOpen] = useState(false)
  return (
    <div className={FRAME}>
      <Button onClick={() => setOpen(true)}>Share project</Button>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3 px-5 pb-6 pt-3">
          <h3 className="text-base font-semibold">Share project</h3>
          <p className="text-sm text-muted-foreground">Anyone with the link can view. Swipe down, tap outside or press Escape to close.</p>
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Copy link
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Required() {
  const [open, setOpen] = useState(false)
  return (
    <div className={FRAME}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} dismissible={false}>
        <div className="space-y-3 px-5 pb-6 pt-3">
          <h3 className="text-base font-semibold">Delete this project?</h3>
          <p className="text-sm text-muted-foreground">This cannot be undone. Choose an answer to close the sheet.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default {
  title: "Bottom Sheet",
  group: "Overlays",
  description:
    "A sheet that rises from the bottom on phones and sits centered on larger screens. It closes on a swipe down, a tap outside or Escape, unless it is required.",
  examples: {
    Dismissible,
    "Requires an answer": Required,
  },
} satisfies Showcase
