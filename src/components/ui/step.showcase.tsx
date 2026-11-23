import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Step } from "@/components/ui/step"

const QUESTIONS = ["What should we call you?", "Where are you based?", "What do you want to build?"]

function SlidesIn() {
  const [index, setIndex] = useState(0)
  return (
    <div className="w-full max-w-sm overflow-hidden">
      <Step key={index}>
        <div className="space-y-1.5">
          <Label htmlFor={`step-${index}`}>{QUESTIONS[index]}</Label>
          <Input id={`step-${index}`} />
        </div>
        <Button onClick={() => setIndex((index + 1) % QUESTIONS.length)}>
          {index === QUESTIONS.length - 1 ? "Start over" : "Next question"}
        </Button>
      </Step>
    </div>
  )
}

export default {
  title: "Step",
  group: "Layout",
  description: "A container for one step of a multi-step flow. It spaces its children evenly and slides in when it mounts.",
  examples: {
    "Slides in on each step": SlidesIn,
    "Tighter spacing": () => (
      <div className="w-full max-w-sm">
        <Step spacing="space-y-3">
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
        </Step>
      </div>
    ),
  },
} satisfies Showcase
