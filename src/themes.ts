/**
 * The themes the site can switch between. Each one is a CSS file in
 * `src/styles/themes/<id>.css` keyed by `[data-theme="<id>"]`. Adding a theme
 * is that file plus an entry here.
 */
export interface Theme {
  id: string
  label: string
  /** CSS background for the theme's dot in the switcher. */
  swatch: string
  /** Dark themes also get the `dark` class, so `dark:` utilities apply. */
  dark?: boolean
}

export const themes: Theme[] = [
  {
    id: "sky",
    label: "Sky",
    swatch: "linear-gradient(135deg, hsl(210 40% 98%) 50%, hsl(201 96% 32%) 50%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    swatch: "linear-gradient(135deg, hsl(222 47% 7%) 50%, hsl(199 89% 62%) 50%)",
    dark: true,
  },
  {
    id: "ember",
    label: "Ember",
    swatch: "linear-gradient(135deg, hsl(30 14% 97%) 50%, hsl(12 84% 39%) 50%)",
  },
]

export const defaultThemeId = themes[0].id
