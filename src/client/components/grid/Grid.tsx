import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './grid.css'

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** each child is one cell */
  children?: ReactNode
  /** the most columns there will be (1 to 12) */
  columns?: number
  /** the narrowest a column may get, in px; when the columns would be narrower, there are fewer of them */
  min?: number
  /** space between the cells: none, xs 8px, sm 16px, md 24px, lg 40px, xl 64px */
  gap?: GridGap
  /** how cells of different heights sit in their row */
  align?: 'start' | 'center' | 'end' | 'stretch'
}

/** Equal cells in rows: as many columns as fit, up to `columns`, none narrower than `min`. Needs no breakpoints:
 *  it follows its own width. */
export function Grid({ children, columns = 3, min = 220, gap = 'md', align = 'stretch', className, style, ...rest }: GridProps) {
  const classes = ['ds-grid', `ds-grid--gap-${gap}`, `ds-grid--${align}`, className].filter(Boolean).join(' ')
  const count = Math.min(12, Math.max(1, Math.round(Number(columns)) || 1))
  const least = Math.max(0, Number(min) || 0)
  return (
    <div {...rest} className={classes} style={{ ...style, '--_ds-grid-columns': count, '--_ds-grid-min': `${least}px` } as CSSProperties}>
      {children}
    </div>
  )
}
