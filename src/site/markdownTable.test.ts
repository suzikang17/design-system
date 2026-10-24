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

  it("stops at the end of the first table", () => {
    const md = "| A | B |\n| --- | --- |\n| 1 | 2 |\n\n## More\n\n| Name | Date |\n| --- | --- |\n| x | y |\n"
    expect(parseMarkdownTable(md)).toEqual({ headers: ["A", "B"], rows: [["1", "2"]] })
  })

  it("keeps a data row made only of dashes", () => {
    const md = "| A | B |\n| --- | --- |\n| - | - |\n| 1 | 2 |\n"
    expect(parseMarkdownTable(md).rows).toEqual([
      ["-", "-"],
      ["1", "2"],
    ])
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
