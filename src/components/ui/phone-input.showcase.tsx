import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { LabeledField } from "@/components/ui/form-field"
import { PhoneInput } from "@/components/ui/phone-input"

const digits = (value: string) => value.replace(/\D/g, "")

function Formats() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs space-y-2">
      <LabeledField label="Phone" htmlFor="phone-formats">
        <PhoneInput id="phone-formats" value={value} onChange={setValue} />
      </LabeledField>
      <p className="text-xs text-muted-foreground">Digits: {digits(value) || "none"}</p>
    </div>
  )
}

function Validated() {
  const [value, setValue] = useState("(555) 01")
  const [touched, setTouched] = useState(true)
  const complete = digits(value).length === 10
  return (
    <div className="w-full max-w-xs">
      <LabeledField
        label="Mobile number"
        htmlFor="phone-validated"
        required
        error={touched && !complete ? "Enter all 10 digits." : undefined}
      >
        <PhoneInput
          id="phone-validated"
          value={value}
          onChange={setValue}
          onBlur={() => setTouched(true)}
          error={touched && !complete}
          success={complete}
        />
      </LabeledField>
    </div>
  )
}

export default {
  title: "Phone Input",
  group: "Inputs",
  description: "A US phone number field that formats as you type, with error and success states.",
  examples: {
    "Formats as you type": Formats,
    "Error and success": Validated,
    "Valid number": () => (
      <div className="w-full max-w-xs">
        <PhoneInput value="(555) 014-2398" onChange={() => undefined} success />
      </div>
    ),
  },
} satisfies Showcase
