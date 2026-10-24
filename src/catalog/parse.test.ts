import { describe, expect, it } from "vitest"

import { isSourceFile, parseShowcaseMeta } from "./parse"

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
