'use client'

import { useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { Button } from '../button/Button'
import './cta-band.css'

export type CtaBandVariant = 'band' | 'mark'

export type CtaBandProps = {
  /** band: a tinted band with a large heading, the words and one or two filled buttons. mark: a quiet centred
   *  invitation with a small ornament over a title-style line and one outlined button */
  variant?: CtaBandVariant
  heading: string
  text?: string
  buttonLabel: string
  buttonHref?: string
  /** a second button, outlined (band only) */
  secondaryLabel?: string
  secondaryHref?: string
  /** the parts fade up one after another when the band enters view */
  animate?: boolean
  className?: string
}

export function CtaBand({
  variant = 'band',
  heading,
  text,
  buttonLabel,
  buttonHref = '#',
  secondaryLabel,
  secondaryHref = '#',
  animate = true,
  className,
}: CtaBandProps) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.2 })
  // hidden only after mount, so the words are never invisible where scripts do not run
  const [armed, setArmed] = useState(false)
  useEffect(() => setArmed(true), [])
  const classes = ['ds-cta-band', `ds-cta-band--${variant}`, animate && armed && 'is-armed', inView && 'is-in', className].filter(Boolean).join(' ')
  const second = variant === 'band' && secondaryLabel
  return (
    <section ref={ref} className={classes}>
      <div className="ds-cta-band__in">
        {variant === 'mark' && <span className="ds-cta-band__mark ds-cta-band__step" aria-hidden="true" />}
        <h2 className="ds-cta-band__heading ds-cta-band__step">{heading}</h2>
        {text && <p className="ds-cta-band__text ds-cta-band__step">{text}</p>}
        <div className="ds-cta-band__actions ds-cta-band__step">
          <Button href={buttonHref} variant={variant === 'band' ? 'primary' : 'outline'}>
            {buttonLabel}
          </Button>
          {second && (
            <Button href={secondaryHref} variant="outline">
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
