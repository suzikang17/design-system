import type { HighlighterCore } from "shiki/core"

let highlighter: Promise<HighlighterCore> | undefined

/** TSX to HTML with light and dark colours as CSS variables. Shiki loads on first use. */
export async function highlight(code: string, lang: "tsx" | "bash" = "tsx"): Promise<string> {
  highlighter ??= Promise.all([import("shiki/core"), import("shiki/engine/javascript")]).then(
    ([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({
        themes: [import("shiki/themes/github-light-default.mjs"), import("shiki/themes/github-dark-default.mjs")],
        langs: [import("shiki/langs/tsx.mjs"), import("shiki/langs/bash.mjs")],
        engine: createJavaScriptRegexEngine(),
      }),
  )
  return (await highlighter).codeToHtml(code, {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
  })
}
