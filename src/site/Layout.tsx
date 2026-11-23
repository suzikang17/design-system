import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { PanelLeft } from "lucide-react"

import { PillButton } from "@/components/ui/pill"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import site from "@/site.config"
import { CatalogNav } from "./CatalogNav"
import { ThemeSwitcher } from "./ThemeSwitcher"

export const SHOW_INSPIRATION = import.meta.env.VITE_SHOW_INSPIRATION === "true"

const headerLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8",
    isActive && "bg-muted text-foreground",
  )

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-4 sm:gap-2 md:px-6">
          <Link to="/" className="mr-auto flex items-center gap-2 rounded-full pr-2 text-[15px] font-semibold tracking-tight">
            <Mark />
            {site.name}
          </Link>
          <nav aria-label="Site" className="flex items-center gap-1">
            <NavLink to="/components" className={headerLink}>
              Components
            </NavLink>
            {SHOW_INSPIRATION && (
              <NavLink to="/inspiration" className={headerLink}>
                Inspiration
              </NavLink>
            )}
          </nav>
          <ThemeSwitcher />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <RouteBoundary path={pathname}>
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </RouteBoundary>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 text-sm text-muted-foreground md:px-6">
          <span className="font-medium text-foreground">{site.name}</span>
          <Link to="/components" className="hover:text-foreground">
            Components
          </Link>
          <a href="/r/registry.json" className="hover:text-foreground">
            Registry index
          </a>
          {site.contactUrl && (
            <a href={site.contactUrl} className="hover:text-foreground">
              Contact
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}

/** The message a deploy gives a tab that still asks for the old page files. */
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i
const RELOADED_AT = "ds-chunk-reload"

/** Reloads the page unless this tab already did so in the last 10 seconds. */
function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOADED_AT))
    if (last && Date.now() - last < 10_000) return false
    sessionStorage.setItem(RELOADED_AT, String(Date.now()))
  } catch {
    return false // No storage, no guard against a reload loop: show the message instead.
  }
  window.location.reload()
  return true
}

/**
 * Catches a page that fails to load or render, below the header. A page
 * file missing after a deploy reloads the tab once; anything else, or a
 * second failure, shows a short message with a Reload button.
 */
class RouteBoundary extends Component<{ path: string; children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {}
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    if (CHUNK_ERROR.test(error.message)) reloadOnce()
  }
  componentDidUpdate(previous: { path: string }) {
    if (previous.path !== this.props.path && this.state.error) this.setState({ error: undefined })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div data-ready="" role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This page did not load</h1>
        <p className="mt-3 text-muted-foreground">
          {CHUNK_ERROR.test(this.state.error.message)
            ? "The site has changed since this tab opened."
            : "Something went wrong while showing it."}{" "}
          Reload to try again.
        </p>
        <PillButton className="mt-6" onClick={() => window.location.reload()}>
          Reload
        </PillButton>
      </div>
    )
  }
}

/** The site mark: a pill with its knob, drawn from the pill scale. */
function Mark() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-4 w-7 items-center rounded-full bg-primary">
      <span className="absolute right-0.5 size-3 rounded-full bg-primary-foreground" />
    </span>
  )
}

export function CatalogLayout() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const aside = useRef<HTMLElement>(null)
  useEffect(() => {
    setOpen(false)
    // Keep the current component's link in view in the side nav, which scrolls on its own.
    const nav = aside.current
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav && link && (link.offsetTop < nav.scrollTop || link.offsetTop > nav.scrollTop + nav.clientHeight - 40)) {
      nav.scrollTop = link.offsetTop - nav.clientHeight / 3
    }
  }, [pathname])

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-10 px-4 md:px-6">
      <aside ref={aside} className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 pr-2 md:block">
        <CatalogNav />
      </aside>
      <div className="min-w-0 flex-1 pb-16 pt-6 md:pt-10">
        <div className="mb-6 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <PillButton variant="outline" className="gap-2">
                <PanelLeft aria-hidden="true" />
                Browse components
              </PillButton>
            </SheetTrigger>
            <SheetContent side="left" aria-describedby={undefined} className="w-72 overflow-y-auto p-0">
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle>Components</SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <CatalogNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
