import { describe, expect, it } from "vitest"

import { classifyImports, importSpecifiers, isSourceFile, parseShowcaseMeta } from "./parse"

describe("classifyImports", () => {
  it("sorts imports into packages and registry items", () => {
    const source = `
      import * as React from "react"
      import { Slot } from "@radix-ui/react-slot"
      import { format } from "date-fns/format"
      import { cn } from "@/lib/utils"
      import { useIsMobile } from "@/hooks/use-mobile"
      import { Button } from "@/components/ui/button"
      import { US_STATE_OPTIONS } from "@/components/ui/state-picker.data"
      import type { Column } from "@tanstack/react-table"
    `
    expect(classifyImports(importSpecifiers(source), "state-picker")).toEqual({
      packages: ["@radix-ui/react-slot", "@tanstack/react-table", "date-fns"],
      items: ["button", "use-mobile", "utils"],
    })
  })

  it("refuses an import a registry item cannot carry", () => {
    expect(() => classifyImports(['@/lib/payments'])).toThrow(/Unsupported import "@\/lib\/payments"/)
    expect(() => classifyImports(["../utils"])).toThrow(/Unsupported import/)
  })
})

describe("parseShowcaseMeta", () => {
  it("reads the literal fields before examples, and ignores sample data", () => {
    const source = `
      const rows = [{ title: "Not this one" }]
      export default {
        title: "Fancy Button",
        group: "Adopted",
        description: "A button with \\"quotes\\" in its text.",
        source: { name: "Example UI", url: "https://example.com/r/fancy-button" },
        license: "MIT",
        examples: { Default: () => null, title: "ignored" },
      }
    `
    expect(parseShowcaseMeta(source)).toEqual({
      title: "Fancy Button",
      group: "Adopted",
      description: 'A button with "quotes" in its text.',
      source: { name: "Example UI", url: "https://example.com/r/fancy-button" },
      license: "MIT",
    })
  })
})

describe("isSourceFile", () => {
  it("keeps components, hooks and data files, and leaves out showcases and tests", () => {
    expect(["button.tsx", "use-mobile.tsx", "use-toast.ts", "state-picker.data.ts"].every(isSourceFile)).toBe(true)
    expect(["button.showcase.tsx", "button.test.tsx", "use-toast.test.ts", "pill.spec.tsx", "notes.md"].some(isSourceFile)).toBe(false)
  })
})
