'use client'

import type { ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'
import './eyebrow.css'

export type EyebrowProps = {
  children: ReactNode
  /** draw a short accent rule in under the text when it enters the viewport */
  line?: boolean
  as?: 'p' | 'span'
}

export function Eyebrow({ children, line = false, as: Tag = 'p' }: EyebrowProps) {
  const [ref, inView] = useInView<HTMLElement>()
  const classes = ['ds-eyebrow', line && 'ds-eyebrow--line', line && inView && 'is-in'].filter(Boolean).join(' ')
  return (
    <Tag ref={ref} className={classes}>
      {children}
    </Tag>
  )
}
