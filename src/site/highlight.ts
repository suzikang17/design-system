import type { HighlighterCore } from "shiki/core"

let highlighter: Promise<HighlighterCore> | undefined

/** TSX (or bash, or CSS) to HTML with light and dark colours as CSS variables. Shiki loads on first use; CSS
 *  grammar only once a CSS file is shown. */
export async function highlight(code: string, lang: "tsx" | "bash" | "css" = "tsx"): Promise<string> {
  highlighter ??= Promise.all([import("shiki/core"), import("shiki/engine/javascript")])
    .then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({
        themes: [import("shiki/themes/github-light-default.mjs"), import("shiki/themes/github-dark-default.mjs")],
        langs: [import("shiki/langs/tsx.mjs"), import("shiki/langs/bash.mjs")],
        engine: createJavaScriptRegexEngine(),
      }),
    )
    .catch((error) => {
      // A chunk that failed to load (say, after a deploy) gets another try next time.
      highlighter = undefined
      throw error
    })
  const ready = await highlighter
  if (lang === "css" && !ready.getLoadedLanguages().includes("css")) await ready.loadLanguage(import("shiki/langs/css.mjs"))
  return ready.codeToHtml(code, {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
  })
}
