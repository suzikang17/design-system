export interface MarkdownTable {
  headers: string[]
  rows: string[][]
}

/**
 * The first pipe table in a markdown document. Cells are split on `|`; an
 * escaped `\|` inside a cell is not supported.
 */
export function parseMarkdownTable(markdown: string): MarkdownTable {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
  const cells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  const isDivider = (line: string) => /^\|?[\s:|-]+\|?$/.test(line) && line.includes("-")

  const [head, ...rest] = lines
  if (!head) return { headers: [], rows: [] }
  return { headers: cells(head), rows: rest.filter((line) => !isDivider(line)).map(cells) }
}

export type InlinePart = { text: string; href?: string }

/** Splits `[text](url)` links out of a cell. Everything else stays plain text. */
export function parseInline(cell: string): InlinePart[] {
  const parts: InlinePart[] = []
  let last = 0
  for (const match of cell.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    if (match.index > last) parts.push({ text: cell.slice(last, match.index) })
    parts.push({ text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < cell.length) parts.push({ text: cell.slice(last) })
  return parts
}
