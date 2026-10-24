import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { WizardNextButton } from "@/components/ui/wizard-next-button"

function Loading() {
  const [loading, setLoading] = useState(false)
  const run = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }
  return (
    <div className="w-full max-w-sm">
      <WizardNextButton label="Save and continue" nextStepTitle="Payment" loading={loading} onClick={run} />
    </div>
  )
}

export default {
  title: "Wizard Next Button",
  group: "Controls",
  description:
    "The full-width continue button of a multi-step flow. It can name the next step and show a loading state, and it ignores a second tap within a second.",
  examples: {
    "Names the next step": () => (
      <div className="w-full max-w-sm">
        <WizardNextButton label="Continue" nextStepTitle="Contact details" onClick={() => undefined} />
      </div>
    ),
    "Loading": Loading,
    "Submit": () => (
      <div className="w-full max-w-sm">
        <WizardNextButton label="Place order" isSubmit submitNote="We email you a receipt." onClick={() => undefined} />
      </div>
    ),
    "Disabled": () => (
      <div className="w-full max-w-sm">
        <WizardNextButton label="Continue" disabled onClick={() => undefined} />
      </div>
    ),
  },
} satisfies Showcase
