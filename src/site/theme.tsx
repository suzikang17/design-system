import * as React from "react"

import { defaultThemeId, themes, type Theme } from "@/themes"

const STORAGE_KEY = "ds-theme"

function storedTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeTheme(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
}

const isTheme = (id: string | null | undefined): id is string => themes.some((t) => t.id === id)

/** A `?theme=<id>` link wins over the saved choice, and becomes the saved choice. */
function initialTheme(): string {
  const fromLink = new URLSearchParams(window.location.search).get("theme")
  if (isTheme(fromLink)) {
    storeTheme(fromLink)
    return fromLink
  }
  const saved = storedTheme()
  return isTheme(saved) ? saved : defaultThemeId
}

interface ThemeState {
  theme: Theme
  setTheme: (id: string) => void
}

const ThemeContext = React.createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = React.useState(initialTheme)
  const theme = themes.find((t) => t.id === id) ?? themes[0]

  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme.id
    root.classList.toggle("dark", Boolean(theme.dark))
  }, [theme])

  const setTheme = React.useCallback((next: string) => {
    if (!isTheme(next)) return
    setId(next)
    storeTheme(next)
  }, [])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeState {
  const state = React.useContext(ThemeContext)
  if (!state) throw new Error("useTheme must be used inside <ThemeProvider>")
  return state
}

/** The dot that stands for a theme. */
export function ThemeSwatch({ theme, className = "" }: { theme: Theme; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 shrink-0 rounded-full border border-foreground/15 ${className}`}
      style={{ background: theme.swatch }}
    />
  )
}
