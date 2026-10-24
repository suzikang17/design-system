import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { WizardProgressBar } from "@/components/ui/wizard-progress-bar"

function Stepping() {
  const [step, setStep] = useState(2)
  return (
    <div className="w-full max-w-sm space-y-4">
      <WizardProgressBar currentStep={step} totalSteps={5} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button size="sm" disabled={step === 5} onClick={() => setStep(step + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default {
  title: "Wizard Progress Bar",
  group: "Feedback",
  description: "A step counter with a percentage and a bar that fills as a multi-step flow goes on.",
  examples: {
    "Step through": Stepping,
    "Your own label": () => (
      <div className="w-full max-w-sm">
        <WizardProgressBar currentStep={7} totalSteps={10} formatLabel={(current, total) => `Question ${current} of ${total}`} />
      </div>
    ),
  },
} satisfies Showcase
