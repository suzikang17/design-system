import { describe, expect, it } from "vitest"

import { parseInline, parseMarkdownTable } from "./markdownTable"

describe("parseMarkdownTable", () => {
  it("reads the header and rows and skips the divider", () => {
    const md = "Intro text\n\n| Link | Why | Status |\n| --- | :-- | --- |\n| [A](https://a.dev) | Clear API | wanted |\n|B|Small|adopted|\n"
    expect(parseMarkdownTable(md)).toEqual({
      headers: ["Link", "Why", "Status"],
      rows: [
        ["[A](https://a.dev)", "Clear API", "wanted"],
        ["B", "Small", "adopted"],
      ],
    })
  })

  it("returns nothing for a document without a table", () => {
    expect(parseMarkdownTable("# Title\n\nNo table.")).toEqual({ headers: [], rows: [] })
  })
})

describe("parseInline", () => {
  it("splits links out of text", () => {
    expect(parseInline("See [the docs](https://x.dev/docs) first")).toEqual([
      { text: "See " },
      { text: "the docs", href: "https://x.dev/docs" },
      { text: " first" },
    ])
  })
})
