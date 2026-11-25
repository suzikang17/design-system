export type ThemeId = 'wecuratelife' | 'urlovematters' | 'neutral'

export const THEMES: readonly { id: ThemeId; label: string }[] = [
  { id: 'wecuratelife', label: 'We Curate Life' },
  { id: 'urlovematters', label: 'ur love matters' },
  { id: 'neutral', label: 'Neutral' },
]

/** Units: every `--ds-track-*` token is a letter-spacing length in em (e.g. `0.12em`), used directly as
 *  `letter-spacing: var(--ds-track-label)`. Never a unitless multiplier.
 *
 *  Every custom property a theme must define. A component is themed when an ancestor has
 *  `data-theme="<ThemeId>"` and class `ds-root`. Later tasks may append, and must then fill all three themes.
 *
 *  Naming, two rules (tested in tokens.test.ts):
 *  - `--ds-*` is this contract and nothing else: the properties a theme may set. Shared roles are
 *    `--ds-<role>-*` (color, font, text, track, ...); a token that only one component reads but that differs per
 *    theme is `--ds-<component>-*` (e.g. `--ds-button-pad`). Every `--ds-*` name in component CSS or set inline by
 *    a component is listed here.
 *  - A component-local knob (a value with no contract token, defined at the top of that component's CSS or set
 *    inline by its TSX) is `--_ds-<component>-<name>` (e.g. `--_ds-button-sheen-dur`). Themes do not set these.
 *
 *  Once the library is released, copied-out components and themes drift apart: a contract token added later
 *  must be read with a fallback in component CSS, `var(--ds-new-token, <old behaviour>)`, as
 *  `--ds-button-fill-border` already is. */
export const TOKENS: readonly string[] = [
  '--ds-color-paper', '--ds-color-panel', '--ds-color-panel-alt', '--ds-color-ink', '--ds-color-ink-soft', '--ds-color-rule', '--ds-color-rule-strong',
  '--ds-color-accent', '--ds-color-accent-soft', '--ds-color-on-photo', '--ds-color-on-ink', '--ds-shade',
  '--ds-color-field-border', '--ds-color-placeholder', '--ds-color-error',
  '--ds-button-text', '--ds-button-track', '--ds-button-pad', '--ds-button-pad-outline', '--ds-button-fill-border',
  '--ds-font-heading', '--ds-font-heading-alt', '--ds-font-title', '--ds-font-label', '--ds-font-mono', '--ds-font-field', '--ds-font-paragraph', '--ds-font-accent',
  '--ds-weight-heading', '--ds-leading-heading',
  '--ds-case-heading', '--ds-case-title', '--ds-case-label',
  '--ds-track-heading', '--ds-track-title', '--ds-track-label',
  '--ds-scale-heading', '--ds-scale-title',
  '--ds-text-xs', '--ds-text-sm', '--ds-text-base', '--ds-text-lg', '--ds-text-xl', '--ds-text-quote',
  '--ds-gutter', '--ds-space-stack', '--ds-space-section',
  '--ds-ease-out', '--ds-ease-spring', '--ds-dur-fast', '--ds-dur-reveal', '--ds-rise',
  '--ds-radius', '--ds-radius-button',
  '--ds-shadow-print', '--ds-shadow-panel', '--ds-grain',
  '--ds-color-plate',
]

export function isThemeId(x: unknown): x is ThemeId {
  return THEMES.some((t) => t.id === x)
}
