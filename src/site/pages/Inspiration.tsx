import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import markdown from "../../../inspiration.md?raw"
import { parseInline, parseMarkdownTable } from "../markdownTable"
import { useTitle } from "../useTitle"

const { headers, rows } = parseMarkdownTable(markdown)

/** Only links to the web are rendered as links. */
const safeHref = (href: string) => (/^https?:\/\//.test(href) ? href : undefined)

export default function Inspiration() {
  useTitle("Inspiration")
  return (
    <div data-ready="" className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Inspiration</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Components from elsewhere worth learning from or adopting. Edit <code className="font-mono text-foreground">inspiration.md</code>{" "}
        to change this list.
      </p>
      <div className="mt-8 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, r) => (
              <TableRow key={r}>
                {row.map((cell, c) => (
                  <TableCell key={c} className="align-top">
                    {headers[c]?.toLowerCase() === "status" ? (
                      <Badge variant={cell === "adopted" ? "default" : "secondary"}>{cell}</Badge>
                    ) : (
                      parseInline(cell).map((part, i) => {
                        const href = part.href && safeHref(part.href)
                        return href ? (
                          <a key={i} href={href} className="font-medium text-primary underline-offset-4 hover:underline">
                            {part.text}
                          </a>
                        ) : (
                          <span key={i}>{part.text}</span>
                        )
                      })
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
