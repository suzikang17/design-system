export interface MarkdownTable {
  headers: string[]
  rows: string[][]
}

/**
 * The first pipe table in a markdown document: the run of lines that start
 * with `|`, beginning at the first one. Cells are split on `|`; an escaped
 * `\|` inside a cell is not supported.
 */
export function parseMarkdownTable(markdown: string): MarkdownTable {
  const all = markdown.split(/\r?\n/).map((line) => line.trim())
  const start = all.findIndex((line) => line.startsWith("|"))
  if (start < 0) return { headers: [], rows: [] }
  const end = all.findIndex((line, i) => i > start && !line.startsWith("|"))
  const lines = all.slice(start, end < 0 ? undefined : end)

  const cells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  // Only the line under the header is the divider; later rows of dashes are data.
  const hasDivider = lines.length > 1 && /^\|[\s:|-]+\|?$/.test(lines[1]) && lines[1].includes("-")

  return { headers: cells(lines[0]), rows: lines.slice(hasDivider ? 2 : 1).map(cells) }
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
