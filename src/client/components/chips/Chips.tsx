'use client'

import type { CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'
import './chips.css'

export type ChipsProps = {
  items: string[]
  /** chips rise in one by one when the group enters the viewport */
  stagger?: boolean
}

export function Chips({ items, stagger = false }: ChipsProps) {
  const [ref, inView] = useInView<HTMLUListElement>()
  if (items.length === 0) return null
  const classes = ['ds-chips', stagger && 'ds-chips--stagger', stagger && inView && 'is-in'].filter(Boolean).join(' ')
  return (
    <ul ref={ref} className={classes}>
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="ds-chip" style={{ '--i': i } as CSSProperties}>
          {item}
        </li>
      ))}
    </ul>
  )
}
