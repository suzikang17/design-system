'use client'

import { useId, type CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'
import { Eyebrow } from '../eyebrow/Eyebrow'
import './steps.css'

export type Step = string | { title: string; text?: string }

export type StepsProps = {
  eyebrow?: string
  heading?: string
  /** a plain string may be written as "Title: text" (split on the first colon) */
  steps: readonly Step[]
  /** show the number above each step, as 1, 2, 3 */
  numbered?: boolean
}

function parse(step: Step): { title: string; text?: string } {
  if (typeof step !== 'string') return step
  const at = step.indexOf(':')
  if (at < 0) return { title: step.trim() }
  return { title: step.slice(0, at).trim(), text: step.slice(at + 1).trim() }
}

export function Steps({ eyebrow, heading, steps, numbered = true }: StepsProps) {
  const [ref, inView] = useInView<HTMLOListElement>()
  const uid = useId()
  const items = steps.map(parse)
  return (
    <section className="ds-steps" aria-labelledby={heading ? `${uid}-h` : undefined} aria-label={heading ? undefined : eyebrow || 'Steps'}>
      {eyebrow ? <Eyebrow line>{eyebrow}</Eyebrow> : null}
      {heading ? <h2 id={`${uid}-h`} className="ds-steps__heading">{heading}</h2> : null}
      <ol ref={ref} className={['ds-steps__list', inView && 'is-in'].filter(Boolean).join(' ')}>
        {items.map((s, i) => (
          <li key={i} className="ds-steps__step" style={{ '--_ds-steps-i': i } as CSSProperties}>
            {numbered ? (
              <span className="ds-steps__num" aria-hidden="true">
                {i + 1}
              </span>
            ) : null}
            <h3 className="ds-steps__title">{s.title}</h3>
            {s.text ? <p className="ds-steps__text">{s.text}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
