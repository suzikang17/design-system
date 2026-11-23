import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { splitShares } from './splitShares'
import './columns.css'

export type ColumnsGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ColumnsProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** each child is one column, in order */
  children?: ReactNode
  /** the columns' shares of the width, separated by slashes: '1/1' is two halves, '2/1' two thirds and a third,
   *  '1/1/1' three thirds, '5/7' five and seven twelfths. Up to twelve columns */
  split?: string
  /** space between the columns: none, xs 8px, sm 16px, md 24px, lg 40px, xl 64px */
  gap?: ColumnsGap
  /** how columns of different heights sit against each other */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** the columns become one stack when the Columns itself is narrower than this: sm 480px, md 640px, lg 900px */
  stackAt?: 'never' | 'sm' | 'md' | 'lg'
  /** once stacked, the last column comes first (a photo on the right goes above its words) */
  reverse?: boolean
}

/** Columns that share the width by a split and become one stack when there is no room. The stacking follows the
 *  Columns' own width, not the screen's, so it also behaves inside a narrow slot. */
export function Columns({ children, split = '1/1', gap = 'md', align = 'start', stackAt = 'md', reverse = false, className, style, ...rest }: ColumnsProps) {
  const classes = ['ds-columns', `ds-columns--gap-${gap}`, `ds-columns--${align}`, `ds-columns--stack-${stackAt}`, reverse && 'ds-columns--reverse', className]
    .filter(Boolean)
    .join(' ')
  const template = splitShares(split)
    .map((share) => `minmax(0, ${share}fr)`)
    .join(' ')
  return (
    <div {...rest} className={classes} style={{ ...style, '--_ds-columns-template': template } as CSSProperties}>
      <div className="ds-columns__grid">{children}</div>
    </div>
  )
}
