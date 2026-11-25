import type { HTMLAttributes, ReactNode } from 'react'
import './row.css'

export type RowGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type RowProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode
  /** space between the children: none, xs 8px, sm 16px, md 24px, lg 40px, xl 64px */
  gap?: RowGap
  /** how children sit top to bottom in the row */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** how children are spread along the row; between pushes the first and last to the ends */
  justify?: 'start' | 'center' | 'end' | 'between'
  /** children that do not fit go to a new line; off keeps one line */
  wrap?: boolean
}

/** Children side by side, each as wide as its content, wrapping to new lines when they run out of room. */
export function Row({ children, gap = 'sm', align = 'center', justify = 'start', wrap = true, className, ...rest }: RowProps) {
  const classes = ['ds-row', `ds-row--gap-${gap}`, `ds-row--align-${align}`, `ds-row--justify-${justify}`, !wrap && 'ds-row--nowrap', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  )
}
