import type { CSSProperties } from "react"

/** A pair of typefaces the playground's page can be set in: one for headings, one for everything else. Each is
 *  already loaded by a look (see tokens/themes), so picking one fetches nothing new. */
export type FontSet = { id: string; label: string; heading: string; body: string }

const SANS = "system-ui, sans-serif"

/** The fonts a visitor can pick from. A page with no pick keeps the fonts of its look. */
export const FONT_SETS: readonly FontSet[] = [
  { id: "cormorant", label: "Cormorant + Inter Tight", heading: '"Cormorant", serif', body: `"Inter Tight", ${SANS}` },
  { id: "garamond", label: "EB Garamond + Sen", heading: '"EB Garamond", Garamond, serif', body: `"Sen", ${SANS}` },
  { id: "garamond-poppins", label: "EB Garamond + Poppins", heading: '"EB Garamond", Garamond, serif', body: `"Poppins", ${SANS}` },
  { id: "poppins", label: "Poppins", heading: `"Poppins", ${SANS}`, body: `"Poppins", ${SANS}` },
  { id: "sen", label: "Sen", heading: `"Sen", ${SANS}`, body: `"Sen", ${SANS}` },
  { id: "tangerine", label: "Tangerine + EB Garamond", heading: '"Tangerine", cursive', body: '"EB Garamond", Garamond, serif' },
  { id: "pacifico", label: "Pacifico + Poppins", heading: '"Pacifico", cursive', body: `"Poppins", ${SANS}` },
  { id: "courier", label: "Courier Prime", heading: '"Courier Prime", "Courier New", monospace', body: '"Courier Prime", "Courier New", monospace' },
  { id: "system", label: "System", heading: SANS, body: SANS },
]

export const fontSet = (id: string | null | undefined): FontSet | undefined => FONT_SETS.find((set) => set.id === id)

/** The look's font tokens, pointed at a picked set. Set on the page's root, they win over the look's own values.
 *  The monospace and accent fonts stay the look's. */
export function fontStyle(id: string | null | undefined): CSSProperties | undefined {
  const set = fontSet(id)
  if (!set) return undefined
  return {
    "--ds-font-heading": set.heading,
    "--ds-font-heading-alt": set.heading,
    "--ds-font-title": set.heading,
    "--ds-font-paragraph": set.body,
    "--ds-font-label": set.body,
    "--ds-font-field": set.body,
  } as CSSProperties
}
