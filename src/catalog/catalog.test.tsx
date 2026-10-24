import { readdirSync, readFileSync } from "node:fs"
import { cleanup, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { entries, GROUPS } from "@/catalog"
import { parseShowcaseMeta } from "@/catalog/parse"

const UI = "src/components/ui"
const componentFiles = readdirSync(UI)
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".showcase.tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort()

describe("catalog discovery", () => {
  it("has an entry for every ui component", () => {
    expect(entries.map((entry) => entry.name).sort()).toEqual(componentFiles)
  })

  it("puts every showcase in a known group", () => {
    for (const entry of entries.filter((e) => e.hasShowcase)) {
      expect(GROUPS, entry.name).toContain(entry.group)
    }
  })

  it("reads each showcase's title, group and description from its text exactly as the module exports them", async () => {
    for (const entry of entries.filter((e) => e.loadShowcase)) {
      const showcase = await entry.loadShowcase!()
      const meta = parseShowcaseMeta(readFileSync(`${UI}/${entry.name}.showcase.tsx`, "utf8"))
      expect(meta, `${entry.name}.showcase.tsx: write these fields as double-quoted strings before examples`).toEqual({
        title: showcase.title,
        group: showcase.group,
        description: showcase.description,
        ...(showcase.source && { source: showcase.source }),
        ...(showcase.license && { license: showcase.license }),
      })
    }
  })

  it("renders every showcase example without throwing", async () => {
    let rendered = 0
    for (const entry of entries.filter((e) => e.loadShowcase)) {
      const { examples } = await entry.loadShowcase!()
      expect(Object.keys(examples).length, `${entry.name} has no examples`).toBeGreaterThan(0)
      for (const [label, Example] of Object.entries(examples)) {
        try {
          render(<Example />)
          rendered += 1
        } catch (error) {
          throw new Error(`${entry.name} › ${label}: ${(error as Error).message}`)
        } finally {
          cleanup()
        }
      }
    }
    expect(rendered).toBeGreaterThan(entries.length)
  })
})
