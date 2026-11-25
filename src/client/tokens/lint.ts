/** Dev-only guards over component CSS (used by the tests; never shipped in the registry). */

/** A line may carry one literal colour when it defines a component-local custom property (`--_ds-…`) and says
 *  why on the same line: `--_ds-photo-white: #ffffff; /* ds-allow-literal: a paper white, not a theme role *\/`.
 *  Any other line with the marker (a plain declaration, a marker with no reason) is scanned as usual. */
const ALLOWED_LINE = /^\s*--_ds-[a-z0-9-]+\s*:[^;]*;\s*\/\*\s*ds-allow-literal:\s*\S[^*]*\*\/\s*$/

const COMMENT = /\/\*[\s\S]*?\*\//g
/** Quoted strings (data-URI masks, `content`): SVG inside them is not CSS. Replaced by `""`. */
const STRING = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g

const HEX = /#[0-9a-f]{3,8}\b/gi
/** rgb()/hsl() with a literal first channel (`rgb(var(--ds-shade) / .2)` is a token), and the newer colour
 *  functions, which have no token form here. `color-mix(` is not `color(`. */
const COLOR_FN = /(?<![\w-])(?:rgba?|hsla?)\(\s*[\d.]|(?<![\w-])(?:oklch|oklab|lab|lch|hwb|color)\(/gi
const FONT_FAMILY = /font-family\s*:(?!\s*(?:var\(|inherit))/gi

/** CSS named colours. `transparent`, `currentColor` and `inherit` are allowed and not listed. */
const NAMED = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue',
  'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
  'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
  'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
  'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
  'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
  'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
  'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
  'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
  'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
  'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
  'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  'yellowgreen',
]
/** Declarations whose value can hold a colour, plus custom-property definitions (a knob may hold one). */
const COLOR_DECL =
  /(?<![\w-])(--[\w-]+|color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|text-decoration(?:-color)?|text-emphasis(?:-color)?|caret-color|accent-color|column-rule(?:-color)?|box-shadow|text-shadow|fill|stroke|stop-color|flood-color|lighting-color|scrollbar-color)\s*:([^;}]*)/gi
const NAMED_WORD = new RegExp(`(?<![\\w-])(?:${NAMED.join('|')})(?![\\w-])`, 'gi')

/** Component CSS with the allowed lines, comments and strings removed: what the guards scan. */
function scannable(css: string): string {
  return css
    .split('\n')
    .map((line) => (ALLOWED_LINE.test(line) ? '' : line))
    .join('\n')
    .replace(COMMENT, '')
    .replace(STRING, '""')
}

/** Returns each literal colour or font-family found in component CSS (component CSS must read tokens only):
 *  hex, rgb()/hsl() with literal channels, oklch()/oklab()/lab()/lch()/hwb()/color(), named colours in colour
 *  declarations, and font-family values that are not `var()` or `inherit`. Comments and quoted strings are
 *  skipped; see ALLOWED_LINE for the one, explicit exception. */
export function findLiterals(css: string): string[] {
  const src = scannable(css)
  const found = [...(src.match(HEX) ?? []), ...(src.match(COLOR_FN) ?? []), ...(src.match(FONT_FAMILY) ?? [])]
  for (const decl of src.matchAll(COLOR_DECL)) found.push(...((decl[2] ?? '').match(NAMED_WORD) ?? []))
  return found
}

const MOTION_DECL = /(?<![\w-])(?:transition|animation)(?:-[a-z-]+)?\s*:([^;}]*)/gi
const TIME = /(?<![\w.-])(?:\d*\.)?\d+m?s\b/gi
const EASING = /cubic-bezier\(|steps\(|(?<![\w-])(?:ease|ease-in|ease-out|ease-in-out|linear)(?![\w-])/gi

/** Returns each literal duration or easing inside a `transition`/`animation` declaration. Custom-property
 *  definitions (`--x: 0.6s`) are allowed, as are `0s` and `none`. Comments are skipped. */
export function findMotionLiterals(css: string): string[] {
  const found: string[] = []
  for (const decl of css.replace(COMMENT, '').matchAll(MOTION_DECL)) {
    const value = decl[1] ?? ''
    for (const t of value.match(TIME) ?? []) if (parseFloat(t) !== 0) found.push(t)
    found.push(...(value.match(EASING) ?? []))
  }
  return found
}
