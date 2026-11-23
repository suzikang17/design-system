import "@/client/tokens/all.css"

import { useId } from "react"
import { Link, useSearchParams } from "react-router-dom"

import type { ComponentMeta, Group } from "@/client/catalog/meta"
import { allMeta, GROUPS } from "@/client/catalog/registry"
import type { ThemeId } from "@/client/tokens/contract"
import { filterPillClass } from "@/components/ui/filter-pill"
import { useTitle } from "../useTitle"
import { inChoice, useClientChoice } from "./clientChoice"
import { originLabel } from "./model"
import { PreviewFit } from "./parts/PreviewFit"

/** Filter pills step up to a 40px touch target below `md`, like the rest of the pill scale. */
const PILL_HEIGHT = "h-10 md:h-8"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
type AnyMeta = ComponentMeta<any>

export default function ClientIndex() {
  useTitle("Client work")
  const [params, setParams] = useSearchParams()
  const { choice } = useClientChoice()
  // An unknown value in the address means "All". The client comes from the picker in the side nav.
  const group = GROUPS.find((g) => g.id === params.get("group"))?.id
  const shown = allMeta.filter((meta) => (!group || meta.group === group) && inChoice(choice, meta.origin))
  // Only groups that hold a piece get a pill; a link may still name an empty one.
  const groups = GROUPS.filter((g) => allMeta.some((meta) => meta.group === g.id))

  const choose = (key: "group", value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div data-ready="">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Client work</h1>
        <p className="mt-3 text-muted-foreground">
          Pieces built for client sites. Pick a client on the left to see their work in their own look, then open a
          piece to try its options.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
        <Filter<Group> label="Group" value={group} options={groups.map((g) => ({ id: g.id, label: g.label }))} onChange={(v) => choose("group", v)} />
      </div>

      {shown.length > 0 ? (
        <ul aria-label="Pieces" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((meta) => (
            <li key={meta.id}>
              <PieceCard meta={meta} look={choice === "all" ? meta.homeTheme : choice} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted-foreground">
          Nothing here yet.{" "}
          <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => setParams({}, { replace: true })}>
            Show all pieces
          </button>
        </p>
      )}
    </div>
  )
}

interface FilterProps<T extends string> {
  label: string
  value: T | undefined
  options: readonly { id: T; label: string }[]
  onChange: (value: T | undefined) => void
}

function Filter<T extends string>({ label, value, options, onChange }: FilterProps<T>) {
  const labelId = useId()
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span id={labelId} className="shrink-0 text-sm font-medium">
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className="-mr-4 flex min-w-0 gap-2 overflow-x-auto pb-1 pr-4 sm:mr-0 sm:pr-0">
        <button type="button" aria-pressed={value === undefined} onClick={() => onChange(undefined)} className={filterPillClass(value === undefined, PILL_HEIGHT)}>
          All
        </button>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(value === option.id ? undefined : option.id)}
            className={filterPillClass(value === option.id, PILL_HEIGHT)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** React 18 has no `inert` prop; the attribute is set on the element itself. */
const makeInert = (element: HTMLElement | null) => element?.setAttribute("inert", "")

/**
 * A card is not a link wrapping a live piece: the piece may hold links, buttons and fields of its own. The name is
 * the link, stretched over the whole card, and the piece is a picture of itself, out of the tab order, the
 * accessibility tree and the pointer's reach.
 */
function PieceCard({ meta, look }: { meta: AnyMeta; look: ThemeId }) {
  const summaryId = useId()
  const Piece = meta.component
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-colors hover:border-primary/50 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background">
      <div ref={makeInert} aria-hidden="true" data-card-view="" className="pointer-events-none relative aspect-[4/3] overflow-hidden border-b">
        {/* Laid out at 10/7 of the card's width and drawn at 0.7, so the piece keeps its real proportions. */}
        <div
          className="ds-root absolute left-0 top-0 grid h-[calc(100%/0.7)] w-[calc(100%/0.7)] origin-top-left scale-[0.7] place-items-center overflow-hidden p-6"
          data-theme={look}
          data-layout={meta.layout}
        >
          {meta.group === "sections" ? (
            // A page section is wider and taller than a card: it is drawn at half size from its top, like the
            // top of a page seen from further away, and the card crops what does not fit.
            <div className="relative h-full w-full overflow-hidden" data-card-crop="">
              <div className="absolute left-0 top-0 w-[200%] origin-top-left scale-50">
                <Piece {...meta.defaults} {...meta.cardProps} />
              </div>
            </div>
          ) : (
            <PreviewFit width={meta.previewWidth}>
              <Piece {...meta.defaults} {...meta.cardProps} />
            </PreviewFit>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="flex items-baseline justify-between gap-3">
          <Link
            to={`/client/${meta.id}`}
            aria-describedby={summaryId}
            className="font-medium outline-none after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:underline-offset-4"
          >
            {meta.name}
          </Link>
          <span className="shrink-0 text-right text-xs text-muted-foreground">{meta.origin.map(originLabel).join(" · ")}</span>
        </span>
        <span id={summaryId} className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {meta.summary}
        </span>
      </div>
    </div>
  )
}
