'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../button/Button'
import './nav-bar.css'

export type NavLinkItem = string | { label: string; href?: string; current?: boolean }

export type NavBarProps = {
  /** the site's name, shown at the left */
  brand: string
  /** where the brand links to */
  brandHref?: string
  /** labels alone render `href="#"` */
  links: readonly NavLinkItem[]
  /** an optional button at the right; shown when `cta` is set */
  cta?: string
  ctaHref?: string
  /** bar: small tracked capitals with an underline that draws in (the We Curate Life bar). menu: a larger serif
   *  brand and quiet links, with a labelled "menu" button on small screens (the ur love matters bar) */
  variant?: 'bar' | 'menu'
  /** stays at the top of its scroll area while the page moves under it */
  sticky?: boolean
  /** which link is the current page, by label (a link object can also say `current`) */
  current?: string
  /** accessible name of the navigation */
  label?: string
  className?: string
}

export function NavBar({
  brand,
  brandHref = '#',
  links,
  cta,
  ctaHref = '#',
  variant = 'bar',
  sticky = false,
  current,
  label = 'Primary',
  className,
}: NavBarProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const items = links.map((l) => (typeof l === 'string' ? { label: l } : l))
  const isCurrent = (l: { label: string; current?: boolean }) => l.current || (current !== undefined && l.label === current)
  const classes = ['ds-navbar', `ds-navbar--${variant}`, sticky && 'ds-navbar--sticky', open && 'is-open', className].filter(Boolean).join(' ')

  const list = (cls: string) => (
    <ul className={cls}>
      {items.map((l, i) => (
        <li key={i}>
          <a href={l.href ?? '#'} aria-current={isCurrent(l) ? 'page' : undefined} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <header ref={rootRef} className={classes}>
      <div className="ds-navbar__inner">
        <a className="ds-navbar__brand" href={brandHref}>
          {brand}
        </a>
        <nav className="ds-navbar__nav" aria-label={label}>
          {list('ds-navbar__links')}
        </nav>
        {cta ? (
          <Button variant="primary" href={ctaHref} className="ds-navbar__cta">
            {cta}
          </Button>
        ) : null}
        <button
          ref={toggleRef}
          type="button"
          className="ds-navbar__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="ds-navbar__toggle-text" aria-hidden="true">
            menu
          </span>
          <span className="ds-navbar__bars" aria-hidden="true" />
        </button>
      </div>
      <div id={panelId} className="ds-navbar__panel" hidden={!open}>
        <nav aria-label={`${label}, menu`}>
          {list('ds-navbar__panel-links')}
          {cta ? (
            <Button variant="primary" href={ctaHref} className="ds-navbar__panel-cta" onClick={() => setOpen(false)}>
              {cta}
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
