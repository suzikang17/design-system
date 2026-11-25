import { useId, type ReactNode } from "react"
import { NavLink } from "react-router-dom"

import { allMeta, GROUPS } from "@/client/catalog/registry"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { THEMES } from "@/client/tokens/contract"
import { inChoice, useClientChoice, type ClientChoice } from "./clientChoice"
import { STYLE_PAGES } from "./styles"

const topLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "block rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
    isActive && "bg-muted text-foreground",
  )

const itemLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    isActive && "bg-primary/10 font-medium text-foreground hover:bg-primary/10",
  )

/**
 * The side nav of the Client work section, drawn like the components nav. The client picker at the top decides
 * whose work is on show: every piece is drawn in that client's look, and the index and the lists below keep to
 * that client's pieces.
 */
export function ClientNav() {
  const { choice, setChoice } = useClientChoice()
  const pickerId = useId()
  const groups = GROUPS.map((group) => ({
    ...group,
    pieces: allMeta.filter((meta) => meta.group === group.id && inChoice(choice, meta.origin)),
  })).filter((group) => group.pieces.length > 0)
  return (
    <nav aria-label="Client work" className="space-y-6 text-sm">
      <div className="px-3">
        <span id={pickerId} className="mb-1.5 block text-xs font-semibold text-foreground">
          Client
        </span>
        <Select value={choice} onValueChange={(next) => setChoice(next as ClientChoice)}>
          <SelectTrigger aria-labelledby={pickerId} className="h-10 w-full md:h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {THEMES.map((look) => (
              <SelectItem key={look.id} value={look.id}>
                {look.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-0.5">
        <NavLink to="/client" end className={topLink}>
          All pieces
        </NavLink>
        <NavLink to="/client/playground" className={topLink}>
          Playground
        </NavLink>
      </div>
      <NavSection title="Styles">
        {STYLE_PAGES.map((page) => (
          <li key={page.id}>
            <NavLink to={`/client/styles/${page.id}`} className={itemLink}>
              {page.title}
            </NavLink>
          </li>
        ))}
      </NavSection>
      {groups.map((group) => (
        <NavSection key={group.id} title={group.label}>
          {group.pieces.map((meta) => (
            <li key={meta.id}>
              <NavLink to={`/client/${meta.id}`} className={itemLink}>
                {meta.name}
              </NavLink>
            </li>
          ))}
        </NavSection>
      ))}
      <div>
        <NavLink to="/client/using" className={topLink}>
          For developers
        </NavLink>
      </div>
    </nav>
  )
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 px-3 text-xs font-semibold text-foreground">{title}</h2>
      <ul>{children}</ul>
    </div>
  )
}
