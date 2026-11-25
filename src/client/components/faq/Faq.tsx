'use client'

import { useId, useState } from 'react'
import { Eyebrow } from '../eyebrow/Eyebrow'
import './faq.css'

export type FaqItem = string | { question: string; answer: string }

export type FaqProps = {
  eyebrow?: string
  heading?: string
  /** a plain string may be written as "Question? Answer" (split after the first question mark) */
  items: readonly FaqItem[]
  /** only one answer open at a time */
  single?: boolean
}

function parse(item: FaqItem): { question: string; answer: string } {
  if (typeof item !== 'string') return item
  const at = item.indexOf('?')
  if (at < 0) return { question: item.trim(), answer: '' }
  return { question: item.slice(0, at + 1).trim(), answer: item.slice(at + 1).trim() }
}

export function Faq({ eyebrow, heading, items, single = true }: FaqProps) {
  const uid = useId()
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set())
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(single ? [] : prev)
      if (prev.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  return (
    <section className="ds-faq" aria-labelledby={heading ? `${uid}-h` : undefined} aria-label={heading ? undefined : eyebrow || 'Questions'}>
      {eyebrow ? <Eyebrow line>{eyebrow}</Eyebrow> : null}
      {heading ? <h2 id={`${uid}-h`} className="ds-faq__heading">{heading}</h2> : null}
      <div className="ds-faq__list">
        {items.map(parse).map((item, i) => {
          const isOpen = open.has(i)
          const btn = `${uid}-q${i}`
          const panel = `${uid}-a${i}`
          return (
            <div key={i} className={['ds-faq__item', isOpen && 'is-open'].filter(Boolean).join(' ')}>
              <h3 className="ds-faq__q">
                <button type="button" id={btn} className="ds-faq__button" aria-expanded={isOpen} aria-controls={panel} onClick={() => toggle(i)}>
                  <span>{item.question}</span>
                  <span className="ds-faq__icon" aria-hidden="true">
                    +
                  </span>
                </button>
              </h3>
              <div id={panel} role="region" aria-labelledby={btn} aria-hidden={isOpen ? undefined : true} className="ds-faq__wrap">
                <div className="ds-faq__a">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
