import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { THEMES, TOKENS, isThemeId } from './contract'
import { findLiterals, findMotionLiterals } from './lint'

const root = join(import.meta.dirname, '..', '..', '..')
const themeCss = (id: string) => readFileSync(join(import.meta.dirname, 'themes', `${id}.css`), 'utf8')

/** The body of the `[data-theme="<id>"]` rule. */
function themeBlock(css: string, id: string): string {
  const at = css.indexOf(`[data-theme="${id}"]`)
  if (at < 0) throw new Error(`no [data-theme="${id}"] selector`)
  const open = css.indexOf('{', at)
  const close = css.indexOf('\n}', open)
  return css.slice(open + 1, close)
}

function filesUnder(dir: string, keep: (path: string) => boolean): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? filesUnder(p, keep) : keep(p) ? [p] : []
  })
}
const cssFiles = (dir: string) => filesUnder(dir, (p) => p.endsWith('.css'))

describe('theme contract', () => {
  it('lists the three themes in order', () => {
    expect(THEMES.map((t) => t.label)).toEqual(['We Curate Life', 'ur love matters', 'Neutral'])
    expect(isThemeId('neutral')).toBe(true)
    expect(isThemeId('nope')).toBe(false)
    expect(isThemeId(undefined)).toBe(false)
  })

  it.each(THEMES.map((t) => t.id))('every theme defines exactly the contract: %s', (id) => {
    const block = themeBlock(themeCss(id), id)
    const defined = new Set(block.match(/--ds-[a-z-]+(?=\s*:)/g))
    expect(defined).toEqual(new Set(TOKENS))
  })

  it.each(THEMES.map((t) => t.id))('theme selector matches its file name: %s', (id) => {
    const css = themeCss(id)
    const rules = css
      .replace(/@font-face\s*{[^}]*}/g, '')
      .replace(/@import[^;]*;/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...rules.matchAll(/([^{}]+){/g)].map((m) => (m[1] ?? '').trim())
    expect(selectors.length).toBe(1)
    expect(selectors[0]).toContain(`[data-theme="${id}"]`)
    if (id !== 'neutral') expect(selectors[0]).toBe(`[data-theme="${id}"]`)
  })
})

describe('track tokens', () => {
  it.each(THEMES.map((t) => t.id))('letter-spacing tokens are em lengths: %s', (id) => {
    const block = themeBlock(themeCss(id), id)
    for (const name of ['heading', 'title', 'label']) {
      const m = block.match(new RegExp(`--ds-track-${name}\\s*:\\s*([^;]+);`))
      expect(m?.[1]?.trim(), `--ds-track-${name}`).toMatch(/^-?(\d+\.?\d*|\.\d+)em$/)
    }
  })
})

describe('findLiterals', () => {
  it.each([
    'color:#fff',
    'background:rgb(0 0 0)',
    'font-family:"Poppins",sans-serif',
    'color: #1A2B3C',
    'font-family: Georgia, serif',
  ])('flags %s', (css) => {
    expect(findLiterals(css).length).toBeGreaterThan(0)
  })

  it.each([
    'color:var(--ds-color-ink)',
    'box-shadow:0 1px rgb(var(--ds-shade) / .2)',
    'font-family:var(--ds-font-label)',
    'font-family:inherit',
  ])('accepts %s', (css) => {
    expect(findLiterals(css)).toEqual([])
  })
})

describe('component css', () => {
  it('no component css uses a literal colour or font', () => {
    for (const file of cssFiles(join(root, 'src', 'client', 'components'))) {
      expect(findLiterals(readFileSync(file, 'utf8')), file).toEqual([])
    }
  })
  it('no component css uses a literal duration or easing', () => {
    for (const file of cssFiles(join(root, 'src', 'client', 'components'))) {
      expect(findMotionLiterals(readFileSync(file, 'utf8')), file).toEqual([])
    }
  })
})

describe('findLiterals', () => {
  it('allows var() and inherit font families, with or without a space', () => {
    expect(findLiterals('a{font-family: var(--x)} b{font-family:var(--x)} c{font-family: inherit}')).toEqual([])
  })
  it('flags literal font families and colours', () => {
    expect(findLiterals('a{font-family: Arial} b{color:#fff} c{color:rgba(0,0,0,.5)}')).toHaveLength(3)
  })
})

describe('findMotionLiterals', () => {
  it('flags literal durations and easings in transition/animation declarations', () => {
    expect(findMotionLiterals('a{transition: left 0.6s ease}')).toEqual(['0.6s', 'ease'])
    expect(findMotionLiterals('a{transition:opacity 200ms cubic-bezier(0.2,0.7,0.2,1)}')).toEqual(['200ms', 'cubic-bezier('])
    expect(findMotionLiterals('a{animation: spin 1s linear infinite}')).toEqual(['1s', 'linear'])
    expect(findMotionLiterals('a{transition-duration: .3s}')).toEqual(['.3s'])
  })
  it('allows custom-property definitions, tokens, 0s and none', () => {
    expect(findMotionLiterals('a{--ds-button-sheen-dur: 0.6s; --x-ease: ease-in-out}')).toEqual([])
    expect(findMotionLiterals('a{transition: left var(--ds-button-sheen-dur) var(--ds-ease-out)}')).toEqual([])
    expect(findMotionLiterals('a{transition: none} b{transition: all 0s} c{animation: none}')).toEqual([])
  })
})

describe('findLiterals, extended', () => {
  it.each([
    'a{color:oklch(70% 0.1 30)}',
    'a{background:oklab(0.7 0.1 0.1)}',
    'a{color:lab(50% 40 59)}',
    'a{color:lch(52% 72 50)}',
    'a{color:hwb(12 50% 0%)}',
    'a{color:color(display-p3 1 0 0)}',
    'a{color:white}',
    'a{background:black}',
    'a{border:1px solid red}',
    'a{border-bottom-color:gray}',
    'a{outline:2px solid grey}',
    'a{box-shadow:0 1px 2px black}',
    'a{--_ds-x-tint: navy}',
    'a{background-color: White}',
    'a{fill:tomato}',
  ])('flags %s', (css) => {
    expect(findLiterals(css).length).toBeGreaterThan(0)
  })

  it.each([
    'a{color:transparent}',
    'a{color:currentColor}',
    'a{border-color:currentcolor}',
    'a{color:inherit}',
    'a{background:color-mix(in srgb, var(--ds-color-ink) 35%, transparent)}',
    'a{transition: color var(--ds-dur-fast) var(--ds-ease-out), background-color var(--ds-dur-fast)}',
    'a{border:1px solid var(--ds-color-rule)}',
    '@media (hover: hover) { a{color:var(--ds-color-ink)} }',
    // a literal inside a comment is not CSS
    'a{color:var(--ds-color-ink)} /* was #ff0000, then red, then oklch(1 0 0) */',
    // an SVG data URI (a mask) is a string: its fill='black' and %23 are not colours
    `a{--_ds-x-mask: url("data:image/svg+xml;utf8,<svg><rect fill='black' filter='url(%23d)'/></svg>")}`,
    "a{content:'#fff'}",
    'a{font-family:var(--ds-font-field, var(--ds-font-mono))}',
  ])('accepts %s', (css) => {
    expect(findLiterals(css)).toEqual([])
  })
})

describe('findLiterals: the ds-allow-literal marker', () => {
  it('allows one literal on a component-local custom property line that gives a reason', () => {
    expect(findLiterals('a{\n  --_ds-photo-white: #ffffff; /* ds-allow-literal: a fixed paper colour */\n}')).toEqual([])
  })
  it('does not allow a literal on the line without the marker, or on the next line', () => {
    expect(findLiterals('a{\n  --_ds-photo-white: #ffffff;\n}')).toEqual(['#ffffff'])
    expect(findLiterals('a{\n  /* ds-allow-literal: reason */\n  --_ds-photo-white: #ffffff;\n}')).toEqual(['#ffffff'])
  })
  it('does not allow a marker with no reason', () => {
    expect(findLiterals('a{\n  --_ds-photo-white: #ffffff; /* ds-allow-literal: */\n}')).toEqual(['#ffffff'])
  })
  it('does not allow a literal in a plain declaration or a contract token', () => {
    expect(findLiterals('a{\n  color: #ffffff; /* ds-allow-literal: because */\n}')).toEqual(['#ffffff'])
    expect(findLiterals('a{\n  --ds-color-paper: #ffffff; /* ds-allow-literal: because */\n}')).toEqual(['#ffffff'])
  })
  it('allows only that one line: a second declaration after it on the same line is not covered', () => {
    expect(findLiterals('a{\n  --_ds-a: #fff; color: red; /* ds-allow-literal: because */\n}').length).toBeGreaterThan(0)
  })
})

describe('findMotionLiterals ignores comments', () => {
  it('a literal duration in a comment is not flagged', () => {
    expect(findMotionLiterals('a{transition: left var(--d) var(--e)} /* transition: left 0.6s ease */')).toEqual([])
  })
})

describe('naming: --ds-* is the contract, component knobs are --_ds-*', () => {
  const componentsDir = join(root, 'src', 'client', 'components')
  const shippedTsx = filesUnder(componentsDir, (p) => p.endsWith('.tsx') && !/\.(test|meta)\.tsx$/.test(p))
  const contractName = /(?<![\w-])--ds-[a-z0-9-]+/g

  it('finds the component css and tsx', () => {
    expect(cssFiles(componentsDir).length).toBeGreaterThan(5)
    expect(shippedTsx.length).toBeGreaterThan(5)
  })

  it('every --ds-* name referenced or defined in component css is a contract token', () => {
    for (const file of cssFiles(componentsDir)) {
      const names = readFileSync(file, 'utf8').match(contractName) ?? []
      expect(names.filter((n) => !TOKENS.includes(n)), file).toEqual([])
    }
  })

  it('every --ds-* name in a shipped component tsx (set inline or otherwise) is a contract token', () => {
    for (const file of shippedTsx) {
      const names = readFileSync(file, 'utf8').match(contractName) ?? []
      expect(names.filter((n) => !TOKENS.includes(n)), file).toEqual([])
    }
  })

  it('component-local knobs are named --_ds-<component>-<name>, after a component of that file', () => {
    for (const file of cssFiles(componentsDir)) {
      for (const [, name] of readFileSync(file, 'utf8').matchAll(/(--_ds-[a-z0-9-]+)\s*:/g)) {
        expect(name, file).toMatch(/^--_ds-[a-z]+(?:-[a-z0-9]+)+$/)
      }
    }
  })

  it('the contract has no component-local prefix and no duplicates', () => {
    expect(TOKENS.every((t) => t.startsWith('--ds-'))).toBe(true)
    expect(new Set(TOKENS).size).toBe(TOKENS.length)
  })
})

/** WCAG 2 relative luminance and contrast, for `#rrggbb` and `rgba()` over an opaque backdrop. */
type RGB = [number, number, number]
const parseColour = (value: string, over?: RGB): RGB => {
  const v = value.trim()
  const hex = v.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16)) as RGB
  const rgba = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i)
  if (rgba) {
    const [r, g, b] = [rgba[1], rgba[2], rgba[3]].map(Number) as RGB
    const a = rgba[4] === undefined ? 1 : Number(rgba[4])
    if (a < 1 && !over) throw new Error(`${v} is translucent: give a backdrop`)
    return a < 1 ? ([r, g, b].map((c, i) => c * a + over![i]! * (1 - a)) as RGB) : [r, g, b]
  }
  throw new Error(`cannot parse colour ${v}`)
}
const luminance = (rgb: RGB) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as RGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

describe('neutral theme contrast', () => {
  const block = themeBlock(themeCss('neutral'), 'neutral')
  const value = (token: string) => {
    const m = block.match(new RegExp(`${token}\\s*:\\s*([^;]+);`))
    if (!m) throw new Error(`neutral has no ${token}`)
    return m[1]!
  }
  const paper = parseColour(value('--ds-color-paper'))

  it('the contrast helper agrees with known values', () => {
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5)
    expect(contrast([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5)
  })

  it('wipe-hover text (ink) on the accent reaches 4.5:1', () => {
    expect(contrast(parseColour(value('--ds-color-ink')), parseColour(value('--ds-color-accent')))).toBeGreaterThanOrEqual(4.5)
  })

  it('the placeholder reaches 4.5:1 against paper', () => {
    expect(contrast(parseColour(value('--ds-color-placeholder'), paper), paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('the field border reaches 3:1 against paper', () => {
    expect(contrast(parseColour(value('--ds-color-field-border'), paper), paper)).toBeGreaterThanOrEqual(3)
  })
})

describe('base.css ships to consumers', () => {
  it('has only the rules it had before the integration, and no bare element selector', () => {
    const css = readFileSync(join(import.meta.dirname, 'base.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...css.matchAll(/([^{}]+){/g)].flatMap((m) => (m[1] ?? '').split(',').map((s) => s.trim()))
    expect(selectors).toEqual(['.ds-root', '.ds-root *', '.ds-root *::before', '.ds-root *::after'])
  })

  it('keeps the catalog-only paragraph margin out of the shipped files', () => {
    const dir = import.meta.dirname
    expect(readFileSync(join(dir, 'base.css'), 'utf8')).not.toMatch(/\bp\s*{/)
    expect(readFileSync(join(dir, 'all.css'), 'utf8')).toMatch(/:where\(\.ds-root\) p/)
  })
})
