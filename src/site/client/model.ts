import type { Origin } from "@/client/catalog/meta"
import { getMeta } from "@/client/catalog/registry"

/** The client sites the pieces come from, in filter order. */
export const ORIGINS: readonly { id: Origin; label: string }[] = [
  { id: "wecuratelife", label: "We Curate Life" },
  { id: "urlovematters", label: "ur love matters" },
]

export const originLabel = (id: Origin) => ORIGINS.find((o) => o.id === id)?.label ?? id

/** A short, plain id (letters, digits, hyphens, at most 40) is named back; anything else from the address is not
 *  echoed into the page. */
const PLAIN_ID = /^[a-z0-9-]{1,40}$/i

export const missingPiece = (id: string | undefined) =>
  id !== undefined && PLAIN_ID.test(id) ? `No piece called ${id}` : "Page not found"

/** The command that installs a registry item from this site, wherever the site is served. */
export const installCommand = (item: string) => `pnpm dlx shadcn@latest add ${window.location.origin}/r/${item}.json`

/** The site page of a client registry item (`client-<id>`), when it is a piece. */
export function clientItemPage(item: string): string | undefined {
  const id = item.replace(/^client-/, "")
  return item.startsWith("client-") && getMeta(id) ? `/client/${id}` : undefined
}

export const pieceTitle = (name: string) => `${name} · Client work`
