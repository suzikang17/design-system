import "@/client/tokens/all.css"

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import { useParams } from "react-router-dom"
import { Play } from "lucide-react"

import { THEMES, TOKENS } from "@/client/tokens/contract"
import { useTitle } from "../useTitle"
import ClientNotFound from "./ClientNotFound"
import { pieceTitle } from "./model"
import { stylePage, type StylePageId } from "./styles"

export default function ClientStyles() {
  const page = stylePage(useParams().page)
  if (!page) return <ClientNotFound message="No style page at this address" />
  return <StylesView key={page.id} id={page.id} title={page.title} lede={page.lede} />
}

function StylesView({ id, title, lede }: { id: StylePageId; title: string; lede: string }) {
  useTitle(pieceTitle(title))
  return (
    <article data-ready="">
      <header className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Styles</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{lede}</p>
      </header>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {THEMES.map((look) => (
          <section
            key={look.id}
            aria-labelledby={`look-${id}-${look.id}`}
            data-look-column=""
            className="ds-root min-w-0 rounded-lg border border-[color:var(--ds-color-rule)] p-5"
            data-theme={look.id}
          >
            <h2 id={`look-${id}-${look.id}`} className="mb-5 font-sans text-sm font-medium">
              {look.label}
            </h2>
            {id === "colour" && <Colours />}
            {id === "type" && <Type />}
            {id === "motion" && <Motion label={look.label} />}
          </section>
        ))}
      </div>
    </article>
  )
}

/** Small print inside a look's column, in the site's face, toned by the look's soft ink. */
const note = "font-sans text-xs text-[color:var(--ds-color-ink-soft)] [overflow-wrap:anywhere]"

/* Colour */

const COLOUR_TOKENS = TOKENS.filter((token) => token.startsWith("--ds-color-"))

/** Reads the value the token resolves to in this look, in the browser. */
function Swatch({ token }: { token: string }) {
  const ref = useRef<HTMLLIElement>(null)
  const [value, setValue] = useState("")
  useLayoutEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(token).trim())
  }, [token])
  return (
    <li ref={ref} data-swatch="" className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-3">
      <span
        aria-hidden="true"
        className="row-span-2 h-12 rounded-md shadow-[inset_0_0_0_1px_var(--ds-color-rule-strong)]"
        style={{ backgroundColor: `var(${token})` }}
      />
      <span data-token="" className="font-sans text-[13px] font-medium [overflow-wrap:anywhere]">
        {token}
      </span>
      <span className={`${note} tabular-nums`}>{value}</span>
    </li>
  )
}

function Colours() {
  return (
    <ul className="grid gap-3.5">
      {COLOUR_TOKENS.map((token) => (
        <Swatch key={token} token={token} />
      ))}
    </ul>
  )
}

/* Type */

const SPECIMENS: readonly { id: string; label: string; family: string; sample: string; style: CSSProperties }[] = [
  {
    id: "heading",
    label: "Heading",
    family: "--ds-font-heading",
    sample: "A way of living",
    style: {
      fontFamily: "var(--ds-font-heading)",
      fontWeight: "var(--ds-weight-heading)" as CSSProperties["fontWeight"],
      lineHeight: "var(--ds-leading-heading)",
      textTransform: "var(--ds-case-heading)" as CSSProperties["textTransform"],
      letterSpacing: "var(--ds-track-heading)",
      fontSize: "calc(var(--ds-text-xl) * 1.2 * var(--ds-scale-heading))",
    },
  },
  {
    id: "heading-alt",
    label: "Heading, alternate",
    family: "--ds-font-heading-alt",
    sample: "A way of living",
    style: {
      fontFamily: "var(--ds-font-heading-alt)",
      fontWeight: "var(--ds-weight-heading)" as CSSProperties["fontWeight"],
      lineHeight: "var(--ds-leading-heading)",
      textTransform: "var(--ds-case-heading)" as CSSProperties["textTransform"],
      letterSpacing: "var(--ds-track-heading)",
      fontSize: "calc(var(--ds-text-xl) * 1.4)",
    },
  },
  {
    id: "title",
    label: "Title",
    family: "--ds-font-title",
    sample: "A way of living",
    style: {
      fontFamily: "var(--ds-font-title)",
      lineHeight: "var(--ds-leading-heading)",
      textTransform: "var(--ds-case-title)" as CSSProperties["textTransform"],
      letterSpacing: "var(--ds-track-title)",
      fontSize: "calc(var(--ds-text-xl) * var(--ds-scale-title))",
    },
  },
  {
    id: "label",
    label: "Label",
    family: "--ds-font-label",
    sample: "Read the story",
    style: {
      fontFamily: "var(--ds-font-label)",
      textTransform: "var(--ds-case-label)" as CSSProperties["textTransform"],
      letterSpacing: "var(--ds-track-label)",
      fontSize: "var(--ds-text-sm)",
    },
  },
  {
    id: "mono",
    label: "Mono",
    family: "--ds-font-mono",
    sample: "Photographed in spring, 2026",
    style: { fontFamily: "var(--ds-font-mono)", fontSize: "var(--ds-text-base)" },
  },
  {
    id: "paragraph",
    label: "Paragraph",
    family: "--ds-font-paragraph",
    sample: "Good rooms are built slowly, from small decisions that add up to a place people want to stay.",
    style: { fontFamily: "var(--ds-font-paragraph)", fontSize: "var(--ds-text-base)", lineHeight: 1.6 },
  },
]

function Type() {
  return (
    <ul className="grid gap-6">
      {SPECIMENS.map((specimen) => (
        <li key={specimen.id} data-specimen={specimen.id}>
          <p className={`${note} mb-1.5`}>{specimen.label}</p>
          <p className="[overflow-wrap:anywhere]" style={specimen.style}>
            {specimen.sample}
          </p>
          <FamilyName family={specimen.family} />
        </li>
      ))}
    </ul>
  )
}

/** The first family of the role's stack in this look, read in the browser. */
function FamilyName({ family }: { family: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [name, setName] = useState("")
  useLayoutEffect(() => {
    if (!ref.current) return
    const stack = getComputedStyle(ref.current).getPropertyValue(family).trim()
    setName(stack.split(",")[0]?.replace(/["']/g, "").trim() ?? "")
  }, [family])
  return (
    <p ref={ref} className={`${note} mt-1.5`}>
      {name}
    </p>
  )
}

/* Motion */

const EASINGS = [
  { id: "out", label: "Ease out", token: "--ds-ease-out" },
  { id: "spring", label: "Ease spring", token: "--ds-ease-spring" },
] as const

const SHAPES: readonly { label: string; style: CSSProperties }[] = [
  {
    label: "Radius",
    style: { borderRadius: "var(--ds-radius)", background: "var(--ds-color-panel)", boxShadow: "inset 0 0 0 1px var(--ds-color-rule-strong)" },
  },
  { label: "Button radius", style: { borderRadius: "var(--ds-radius-button)", background: "var(--ds-color-ink)" } },
  { label: "Print shadow", style: { background: "var(--ds-color-panel)", filter: "var(--ds-shadow-print)" } },
  { label: "Panel shadow", style: { background: "var(--ds-color-panel)", boxShadow: "var(--ds-shadow-panel)" } },
  {
    label: "Grain",
    style: { background: "var(--ds-grain), var(--ds-color-panel)", boxShadow: "inset 0 0 0 1px var(--ds-color-rule-strong)" },
  },
]

function Motion({ label }: { label: string }) {
  return (
    <div className="grid gap-7">
      {EASINGS.map((easing) => (
        <EasingDemo key={easing.id} label={easing.label} token={easing.token} look={label} />
      ))}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))] gap-x-3.5 gap-y-6">
        {SHAPES.map((shape) => (
          <li key={shape.label} className="grid gap-2">
            <span aria-hidden="true" className="block h-16" style={shape.style} />
            <span className={note}>{shape.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The dot rests at the start; Play remounts it so it travels once, then stays at the end. Under reduced motion
 *  the site's stylesheet shortens the animation to nothing, so it simply shows the end state. */
function EasingDemo({ label, token, look }: { label: string; token: string; look: string }) {
  const [runs, setRuns] = useState(0)
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-sans text-sm font-medium">{label}</p>
          <p className={note}>{token}</p>
        </div>
        {/* Drawn in the look's own ink and rules, so it sits on the look's paper whatever the site theme. */}
        <button
          type="button"
          onClick={() => setRuns((n) => n + 1)}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--ds-color-rule-strong)] bg-transparent px-3 font-sans text-xs font-medium text-[color:var(--ds-color-ink)] transition-colors hover:bg-[color:var(--ds-color-panel)] md:h-8"
        >
          <Play aria-hidden="true" className="size-3.5" />
          Play<span className="sr-only">, {label}, {look}</span>
        </button>
      </div>
      <div
        aria-hidden="true"
        className="relative mt-4 h-3.5 rounded-full bg-[color:var(--ds-color-panel)] shadow-[inset_0_0_0_1px_var(--ds-color-rule)]"
      >
        <span
          key={runs}
          data-run={runs > 0 ? "" : undefined}
          className={
            runs > 0
              ? "absolute left-[calc(100%-0.875rem)] top-0 size-3.5 animate-travel rounded-full bg-[color:var(--ds-color-accent)]"
              : "absolute left-0 top-0 size-3.5 rounded-full bg-[color:var(--ds-color-accent)]"
          }
          style={runs > 0 ? { animationTimingFunction: `var(${token})` } : undefined}
        />
      </div>
    </div>
  )
}
