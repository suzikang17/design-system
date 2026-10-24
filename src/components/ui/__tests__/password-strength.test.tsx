import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PasswordStrength } from "../password-strength"

describe("PasswordStrength", () => {
  it("rates a short password weak however mixed it is", () => {
    render(<PasswordStrength password="A1!" />)
    expect(screen.getByText("Weak")).toBeInTheDocument()
  })

  it("rates a long, mixed password strong", () => {
    render(<PasswordStrength password="Tangerine-42" />)
    expect(screen.getByText("Strong")).toBeInTheDocument()
  })

  it("falls back to the default word for a label passed as undefined", () => {
    render(<PasswordStrength password="A1!" labels={{ weak: undefined }} />)
    expect(screen.getByText("Weak")).toBeInTheDocument()
  })
})
