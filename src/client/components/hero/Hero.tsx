'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'
import { Button } from '../button/Button'
import { Eyebrow } from '../eyebrow/Eyebrow'
import { Photo, type Img } from '../photo/Photo'
import './hero.css'

export type HeroVariant = 'split' | 'wordmark'

export type HeroProps = {
  /** split: the photo beside the words. wordmark: a large centred title with the photo tucked under it */
  variant?: HeroVariant
  /** a small label above the title (split) or the line above the photo (wordmark) */
  eyebrow?: string
  title: string
  text?: string
  ctaLabel?: string
  ctaHref?: string
  image?: Img
  /** the section's least height: a number is px, a string any CSS length. It never reads the window's height */
  minHeight?: number | string
  /** the words rise in when the section enters view */
  animate?: boolean
  className?: string
}

export function Hero({
  variant = 'split',
  eyebrow,
  title,
  text,
  ctaLabel,
  ctaHref = '#',
  image,
  minHeight,
  animate = true,
  className,
}: HeroProps) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 })
  // hidden only after mount, so the words are never invisible where scripts do not run
  const [armed, setArmed] = useState(false)
  useEffect(() => setArmed(true), [])
  const classes = ['ds-hero', `ds-hero--${variant}`, !image && 'ds-hero--no-image', animate && armed && 'is-armed', inView && 'is-in', className]
    .filter(Boolean)
    .join(' ')
  const style = (minHeight !== undefined ? { '--_ds-hero-min': typeof minHeight === 'number' ? `${minHeight}px` : minHeight } : undefined) as CSSProperties | undefined

  const words = (
    <div className="ds-hero__copy">
      {variant === 'split' && eyebrow && (
        <div className="ds-hero__step">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h1 className="ds-hero__title ds-hero__step">{title}</h1>
      {variant === 'wordmark' && eyebrow && <p className="ds-hero__line ds-hero__step">{eyebrow}</p>}
    </div>
  )
  const photo = image && (
    <div className="ds-hero__media ds-hero__step">
      <Photo image={image} ratio={variant === 'split' ? '4/5' : '3/4'} loading="eager" fetchPriority="high" />
    </div>
  )
  const rest = (text || (ctaLabel && ctaHref)) && (
    <div className="ds-hero__rest">
      {text && <p className="ds-hero__text ds-hero__step">{text}</p>}
      {ctaLabel && (
        <div className="ds-hero__cta ds-hero__step">
          <Button href={ctaHref} variant={variant === 'split' ? 'primary' : 'outline'}>
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  )

  if (variant === 'wordmark') {
    return (
      <section ref={ref} className={classes} style={style}>
        <div className="ds-hero__box">
          {words}
          {photo}
          {rest}
        </div>
      </section>
    )
  }
  return (
    <section ref={ref} className={classes} style={style}>
      <div className="ds-hero__box">
        {photo}
        <div className="ds-hero__body">
          {words}
          {rest}
        </div>
      </div>
    </section>
  )
}
