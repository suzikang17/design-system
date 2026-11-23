import type { ReactNode } from "react"

/** Gives a piece with `previewWidth` that width (capped at the space available); anything else renders as is. */
export function PreviewFit({ width, children }: { width?: number; children: ReactNode }) {
  if (!width) return children
  return (
    <div data-preview-fit="" style={{ width: "100%", maxWidth: width }}>
      {children}
    </div>
  )
}
