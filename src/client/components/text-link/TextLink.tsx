import type { AnchorHTMLAttributes, ReactNode } from 'react'
import './text-link.css'

export type TextLinkProps = {
  href?: string
  children: ReactNode
  /** append a decorative arrow that shifts right on hover */
  arrow?: boolean
  /** 'static': a fixed rule that darkens on hover; 'grow': the rule draws in from the left on hover */
  underline?: 'static' | 'grow'
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'>

const UNSAFE_SCHEME = /^(?:javascript|data|vbscript):/i

/** Strips whitespace and control characters (browsers ignore them inside a scheme) before testing. */
function isSafeHref(href: string): boolean {
  // eslint-disable-next-line no-control-regex
  const cleaned = href.replace(/[\u0000- \u007f-\u009f]/g, '')
  return !UNSAFE_SCHEME.test(cleaned)
}

export function TextLink({ href, children, arrow = false, underline = 'static', className, ...rest }: TextLinkProps) {
  const classes = ['ds-textlink', underline === 'grow' && 'ds-textlink--grow', className].filter(Boolean).join(' ')
  const safe = href !== undefined && isSafeHref(href)
  return (
    <a {...rest} className={classes} href={safe ? href : undefined}>
      {children}
      {arrow && (
        <span className="ds-textlink__arrow" aria-hidden="true">
          {'⟶'}
        </span>
      )}
    </a>
  )
}
