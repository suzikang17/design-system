import { useEffect, useState } from "react"

import { CopyButton } from "./CopyButton"
import { highlight } from "./highlight"

export function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const [html, setHtml] = useState<string>()

  useEffect(() => {
    let live = true
    setHtml(undefined)
    highlight(code)
      .then((result) => live && setHtml(result))
      .catch(() => undefined) // Plain text stays on screen.
    return () => {
      live = false
    }
  }, [code])

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b py-1 pl-4 pr-1">
        <span className="truncate font-mono text-xs text-muted-foreground">{filename}</span>
        <CopyButton value={code} label={`Copy ${filename}`} />
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label={`Source of ${filename}`}
        data-highlighted={html ? "" : undefined}
        className="code-block max-h-[36rem] overflow-auto text-[13px] leading-relaxed"
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
