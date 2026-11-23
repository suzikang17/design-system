import type { ReactNode } from 'react'
import './footer.css'

export type SocialKind = 'instagram' | 'facebook' | 'email' | 'pinterest' | 'youtube' | 'link'
export type FooterSocial = { kind: SocialKind; href: string; label?: string }
export type FooterLinkItem = string | { label: string; href?: string }

export type FooterProps = {
  /** the site's name */
  brand?: string
  /** a short line under or beside the name, such as a place */
  tagline?: string
  /** labels alone render `href="#"` */
  links?: readonly FooterLinkItem[]
  /** icon links; each is named for its kind (or `label`) */
  social?: readonly FooterSocial[]
  /** minimal: everything in one centred column, icons over the small print (the We Curate Life footer).
   *  row: name, line and links across one row with a rule above (the ur love matters footer) */
  variant?: 'minimal' | 'row'
  /** the small print; by default "© <year> <brand>" */
  copyright?: string
  /** the year in the default small print */
  year?: number
  /** anything extra, placed above the small print */
  children?: ReactNode
  className?: string
}

const NAMES: Record<SocialKind, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
  link: 'Link',
}

/** Simple outlined glyphs on a 24px grid, drawn with the current text colour. */
function Glyph({ kind }: { kind: SocialKind }) {
  const p = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true, focusable: false } as const
  switch (kind) {
    case 'instagram':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="M15.5 7.5h-1.6c-1.3 0-2.1.8-2.1 2.1V21M9.5 12.5h5.5" />
        </svg>
      )
    case 'email':
      return (
        <svg {...p}>
          <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
          <path d="M3.5 6.5 12 13l8.5-6.5" />
        </svg>
      )
    case 'pinterest':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M11 8.5c2.8-.6 4.5 1 4 3.2-.4 1.9-1.8 3-3.1 2.6-1.1-.4-1-1.6-.6-2.8M11.3 13.5 10 19" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...p}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10 9.2 5 2.8-5 2.8z" />
        </svg>
      )
    default:
      return (
        <svg {...p}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      )
  }
}

export function Footer({ brand, tagline, links, social, variant = 'minimal', copyright, year, children, className }: FooterProps) {
  const classes = ['ds-footer', `ds-footer--${variant}`, className].filter(Boolean).join(' ')
  const items = (links ?? []).map((l) => (typeof l === 'string' ? { label: l } : l))
  const small = copyright || `© ${year ?? new Date().getFullYear()}${brand ? ` ${brand}` : ''}`

  const icons = social && social.length > 0 && (
    <ul className="ds-footer__social" aria-label="Social">
      {social.map((s, i) => (
        <li key={i}>
          <a
            href={s.href}
            aria-label={s.label ?? NAMES[s.kind]}
            {...(s.kind !== 'email' && /^https?:/i.test(s.href) ? { target: '_blank', rel: 'noopener' } : {})}
          >
            <Glyph kind={s.kind} />
          </a>
        </li>
      ))}
    </ul>
  )
  const nav = items.length > 0 && (
    <nav className="ds-footer__links" aria-label="Footer">
      <ul>
        {items.map((l, i) => (
          <li key={i}>
            <a href={l.href ?? '#'}>{l.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )

  if (variant === 'row') {
    return (
      <footer className={classes}>
        <div className="ds-footer__inner">
          {brand ? <span className="ds-footer__brand">{brand}</span> : null}
          {tagline ? <span className="ds-footer__tagline">{tagline}</span> : null}
          {nav}
          {icons}
        </div>
        {children}
        <p className="ds-footer__small">{small}</p>
      </footer>
    )
  }
  return (
    <footer className={classes}>
      {brand ? <span className="ds-footer__brand">{brand}</span> : null}
      {tagline ? <span className="ds-footer__tagline">{tagline}</span> : null}
      {nav}
      {children}
      {icons}
      <p className="ds-footer__small">{small}</p>
    </footer>
  )
}
