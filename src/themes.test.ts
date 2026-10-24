import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { themes } from "./themes"

const DIR = "src/styles/themes"

function tokens(id: string): Record<string, string> {
  const css = readFileSync(`${DIR}/${id}.css`, "utf8")
  return Object.fromEntries([...css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

/** "210 40% 98%" → linear RGB. */
function rgb(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.replace(/%/g, "").split(/\s+/).map(Number)
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const c = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}

function contrast(a: [number, number, number], b: [number, number, number]) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** `fg` over `bg` blended at `alpha`, as a `bg-primary/10` tint is. */
const blend = (fg: [number, number, number], bg: [number, number, number], alpha: number) =>
  fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as [number, number, number]

const TEXT_PAIRS = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-accent-foreground", "sidebar-accent"],
  ["primary", "background"],
  ["primary", "card"],
  ["destructive", "background"],
]

describe("themes", () => {
  it("has one CSS file per entry in themes.ts", () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith(".css")).map((f) => f.replace(/\.css$/, ""))
    expect(files.sort()).toEqual(themes.map((t) => t.id).sort())
  })

  it.each(themes)("$id declares the color scheme its entry says", (theme) => {
    const css = readFileSync(`${DIR}/${theme.id}.css`, "utf8")
    expect(css).toContain(`[data-theme="${theme.id}"]`)
    expect(css).toContain(`color-scheme: ${theme.dark ? "dark" : "light"}`)
  })

  it.each(themes)("$id meets WCAG AA (4.5:1) for every text and background pair", (theme) => {
    const t = tokens(theme.id)
    const failures: string[] = []
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrast(rgb(t[fg]), rgb(t[bg]))
      if (ratio < 4.5) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)}`)
    }
    const tint = blend(rgb(t.primary), rgb(t.background), 0.1)
    for (const fg of ["primary", "foreground"]) {
      const ratio = contrast(rgb(t[fg]), tint)
      if (ratio < 4.5) failures.push(`${fg} on a primary/10 tint: ${ratio.toFixed(2)}`)
    }
    expect(failures).toEqual([])
  })
})
