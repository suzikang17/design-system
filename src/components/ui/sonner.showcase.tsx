import { toast } from "sonner"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

export default {
  title: "Sonner",
  group: "Feedback",
  description: "A themed Toaster for sonner toasts, which stack and can be swiped away. Mount it once, then call toast() from anywhere.",
  examples: {
    "Show a toast": () => (
      <>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => toast("Draft saved")}>
            Save draft
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Invite sent", { description: "Priya Patel can join the project now." })}
          >
            Send invite
          </Button>
        </div>
        <Toaster />
      </>
    ),
  },
} satisfies Showcase
