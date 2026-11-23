import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

import { allMeta, GROUPS } from "@/client/catalog/registry"
import { cn } from "@/lib/utils"
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

/** The side nav of the Client work section, drawn like the components nav. */
export function ClientNav() {
  const groups = GROUPS.map((group) => ({ ...group, pieces: allMeta.filter((meta) => meta.group === group.id) })).filter(
    (group) => group.pieces.length > 0,
  )
  return (
    <nav aria-label="Client work" className="space-y-6 text-sm">
      <div className="space-y-0.5">
        <NavLink to="/client" end className={topLink}>
          All pieces
        </NavLink>
        <NavLink to="/client/using" className={topLink}>
          Using these
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
