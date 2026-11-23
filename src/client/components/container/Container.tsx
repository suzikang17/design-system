import type { HTMLAttributes, ReactNode } from 'react'
import './container.css'

export type ContainerWidth = 'text' | 'page' | 'wide' | 'full'

export type ContainerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode
  /** the widest the content gets: text (720px, a comfortable line), page (1180px, what the sections use),
   *  wide (1440px) or full (no cap) */
  width?: ContainerWidth
  /** the look's side gutters; off for content that should touch the edges */
  gutter?: boolean
  /** the look's section spacing above and below */
  pad?: boolean
}

/** Centres its content on the page, capped at a width, inside the look's side gutters. Sections are built to the
 *  same width and gutters, so content in a `page` container lines up with them. */
export function Container({ children, width = 'page', gutter = true, pad = false, className, ...rest }: ContainerProps) {
  const classes = ['ds-container', `ds-container--${width}`, !gutter && 'ds-container--flush', pad && 'ds-container--pad', className].filter(Boolean).join(' ')
  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  )
}
