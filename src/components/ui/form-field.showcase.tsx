import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { LabeledField, inputCn } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

function Field() {
  const [value, setValue] = useState("")
  const error = value && !value.includes("@") ? "Enter an email address with an @." : undefined
  return (
    <div className="w-full max-w-sm">
      <LabeledField label="Work email" htmlFor="field-email" required error={error}>
        <Input
          id="field-email"
          type="email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="alex@example.com"
          className={inputCn(Boolean(error))}
        />
      </LabeledField>
    </div>
  )
}

export default {
  title: "Form Field",
  group: "Inputs",
  description: "A label, a control and an error message stacked together, plus class helpers for a field's normal and error states.",
  examples: { "Label, field and error": Field },
} satisfies Showcase
