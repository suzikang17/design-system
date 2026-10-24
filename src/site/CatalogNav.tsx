import { NavLink } from "react-router-dom"

import { entriesByGroup } from "@/catalog"
import { cn } from "@/lib/utils"

export function CatalogNav() {
  return (
    <nav aria-label="Components" className="space-y-6 text-sm">
      <NavLink
        to="/components"
        end
        className={({ isActive }) =>
          cn(
            "block rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            isActive && "bg-muted text-foreground",
          )
        }
      >
        All components
      </NavLink>
      {entriesByGroup().map(({ group, entries }) => (
        <div key={group}>
          <h2 className="mb-1 px-3 text-xs font-semibold text-foreground">{group}</h2>
          <ul>
            {entries.map((entry) => (
              <li key={entry.name}>
                <NavLink
                  to={`/components/${entry.name}`}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-primary/10 font-medium text-foreground hover:bg-primary/10",
                    )
                  }
                >
                  {entry.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
