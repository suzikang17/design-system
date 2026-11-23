/* eslint-disable react-refresh/only-export-components -- a context with its hook */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { isThemeId, type ThemeId } from "@/client/tokens/contract"

/** Which client's work is on show: one look, or "all" (every piece in the look of the site it came from). */
export type ClientChoice = ThemeId | "all"

const KEY = "ds-client"
const noop = () => {}
const Context = createContext<{ choice: ClientChoice; setChoice: (next: ClientChoice) => void }>({ choice: "all", setChoice: noop })

/** A link that names a look (`?look=`, or the older `?from=`) wins; then the last pick in this tab; then "all". */
function firstChoice(): ClientChoice {
  const params = new URLSearchParams(window.location.search)
  for (const value of [params.get("look"), params.get("from")]) if (isThemeId(value ?? "")) return value as ThemeId
  try {
    const stored = window.sessionStorage.getItem(KEY)
    if (stored && isThemeId(stored)) return stored
  } catch {
    // storage may be blocked; the pick then lasts until the page is reloaded
  }
  return "all"
}

export function ClientChoiceProvider({ children }: { children: ReactNode }) {
  const [choice, set] = useState<ClientChoice>(firstChoice)
  const value = useMemo(
    () => ({
      choice,
      setChoice: (next: ClientChoice) => {
        set(next)
        try {
          if (next === "all") window.sessionStorage.removeItem(KEY)
          else window.sessionStorage.setItem(KEY, next)
        } catch {
          // see firstChoice
        }
      },
    }),
    [choice],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

/** The picked client, and how to pick another. Outside the provider the choice is "all" and cannot change. */
export const useClientChoice = () => useContext(Context)

/** Whether a piece from `origin` belongs to the pick. Neutral is no client's own look, so it shows every piece. */
export const inChoice = (choice: ClientChoice, origin: readonly string[]) => choice === "all" || choice === "neutral" || origin.includes(choice)
