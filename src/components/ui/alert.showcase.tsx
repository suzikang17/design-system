import { AlertCircle, Terminal } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default {
  title: "Alert",
  group: "Feedback",
  description: "A callout for a message that needs attention, in a default and a destructive style.",
  examples: {
    "Default and destructive": () => (
      <div className="w-full max-w-md space-y-3">
        <Alert>
          <Terminal className="size-4" />
          <AlertTitle>New version available</AlertTitle>
          <AlertDescription>Reload the page to get the latest features.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>Your card was declined. Update it to keep your plan.</AlertDescription>
        </Alert>
      </div>
    ),
  },
} satisfies Showcase
