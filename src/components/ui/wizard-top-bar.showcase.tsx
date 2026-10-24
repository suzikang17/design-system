import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { WizardTopBar } from "@/components/ui/wizard-top-bar"

const PHASES = [
  { label: "Account", stepCount: 2 },
  { label: "Profile", stepCount: 3 },
  { label: "Billing", stepCount: 2 },
]
const STEPS = [
  { id: "email", title: "Email and password" },
  { id: "verify", title: "Verify your email" },
  { id: "name", title: "Your name" },
  { id: "photo", title: "Profile photo", optional: true },
  { id: "bio", title: "Short bio", optional: true },
  { id: "plan", title: "Choose a plan" },
  { id: "card", title: "Payment details" },
]

/** Which phase a step index falls in. */
function phaseOf(step: number) {
  let end = 0
  return PHASES.findIndex((phase) => (end += phase.stepCount) > step)
}

/** On a phone the bar is fixed to the top of the screen; here it sits in its frame. */
const FRAME = "w-full max-w-2xl [&>div:first-child]:!static"

function Phases() {
  const [step, setStep] = useState(3)
  return (
    <div className={FRAME}>
      <WizardTopBar
        currentStep={step}
        totalSteps={STEPS.length}
        steps={STEPS}
        phases={PHASES}
        currentPhase={phaseOf(step)}
        onBack={() => setStep(Math.max(0, step - 1))}
        isFirstStep={step === 0}
        onExit={() => setStep(0)}
      />
    </div>
  )
}

function StepPicker() {
  const [step, setStep] = useState(2)
  return (
    <div className={FRAME}>
      <WizardTopBar
        currentStep={step}
        totalSteps={STEPS.length}
        steps={STEPS}
        onStepClick={setStep}
        onBack={() => setStep(Math.max(0, step - 1))}
        onExit={() => setStep(0)}
      />
    </div>
  )
}

function Skippable() {
  const [step, setStep] = useState(3)
  return (
    <div className={FRAME}>
      <WizardTopBar
        currentStep={step}
        totalSteps={STEPS.length}
        steps={STEPS}
        isOptionalStep={Boolean(STEPS[step]?.optional)}
        onSkip={() => setStep(Math.min(STEPS.length - 1, step + 1))}
        onBack={() => setStep(Math.max(0, step - 1))}
        labels={{ skip: "Skip for now" }}
      />
    </div>
  )
}

export default {
  title: "Wizard Top Bar",
  group: "Navigation",
  description:
    "The header of a multi-step flow: progress, the current step's title, and back and exit controls. It is fixed to the top on phones and sits inline on desktop.",
  examples: {
    "Progress by phase": Phases,
    "Progress by step, with a step picker": StepPicker,
    "An optional step you can skip": Skippable,
  },
} satisfies Showcase
