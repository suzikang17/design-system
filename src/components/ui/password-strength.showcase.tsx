import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrength } from "@/components/ui/password-strength"

function AsYouType() {
  const [password, setPassword] = useState("Correct1")
  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="strength-password">New password</Label>
      <Input id="strength-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <PasswordStrength password={password} />
    </div>
  )
}

export default {
  title: "Password Strength",
  group: "Feedback",
  description: "A four-segment meter that rates a password on its length, capitals, numbers and symbols.",
  examples: {
    "As you type": AsYouType,
    "Every level": () => (
      <div className="w-full max-w-xs space-y-4">
        {["abc", "abcdefgh", "Abcdefgh1", "Abcdefgh1!"].map((password) => (
          <PasswordStrength key={password} password={password} />
        ))}
      </div>
    ),
    "Your own words": () => (
      <div className="w-full max-w-xs">
        <PasswordStrength password="Abcdefgh1" labels={{ good: "Good, add a symbol to finish" }} />
      </div>
    ),
  },
} satisfies Showcase
