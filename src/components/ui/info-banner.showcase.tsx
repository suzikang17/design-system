import { AlertTriangle, CheckCircle2, Info, Lock } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { InfoBanner } from "@/components/ui/info-banner"

export default {
  title: "Info Banner",
  group: "Feedback",
  description: "A tinted note that gives context inside a form or a page, in info, success, warning and neutral tones.",
  examples: {
    Tones: () => (
      <div className="w-full max-w-md space-y-3">
        <InfoBanner icon={<Info className="size-4 text-primary" />}>Invites expire after seven days.</InfoBanner>
        <InfoBanner variant="success" icon={<CheckCircle2 className="size-4" />}>
          Your changes are saved.
        </InfoBanner>
        <InfoBanner variant="warning" icon={<AlertTriangle className="size-4" />}>
          Your trial ends in three days.
        </InfoBanner>
        <InfoBanner variant="neutral" icon={<Lock className="size-4" />}>
          Only admins can change billing.
        </InfoBanner>
      </div>
    ),
    "Longer text": () => (
      <InfoBanner className="w-full max-w-md">
        <p className="font-medium">Before you import</p>
        <p>Use one row per contact, with the email address in the first column. Rows without an email are skipped.</p>
      </InfoBanner>
    ),
  },
} satisfies Showcase
