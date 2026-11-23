import type { HTMLAttributes, ReactNode } from 'react'
import './stack.css'

export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type StackProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode
  /** space between the children: none, xs 8px, sm 16px, md 24px, lg 40px, xl 64px */
  gap?: StackGap
  /** how children sit across the stack; stretch makes each as wide as the stack */
  align?: 'stretch' | 'start' | 'center' | 'end'
}

/** Children one under another, evenly spaced. */
export function Stack({ children, gap = 'md', align = 'stretch', className, ...rest }: StackProps) {
  const classes = ['ds-stack', `ds-stack--gap-${gap}`, `ds-stack--${align}`, className].filter(Boolean).join(' ')
  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  )
}
