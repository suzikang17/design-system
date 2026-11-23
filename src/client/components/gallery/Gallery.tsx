'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'
import { Photo, type Img } from '../photo/Photo'
import { dealColumns, type Placed } from './dealColumns'
import './gallery.css'

export type GalleryLayout = 'wall' | 'row'

export type GalleryProps = {
  images: readonly Img[]
  /** wall: staggered columns that scroll with the page. row: one staggered row that scrolls sideways */
  layout?: GalleryLayout
  /** wall: columns on wide screens (900px and up); narrower screens always get two */
  columns?: 2 | 3
  /** '4/5' crops every tile to the same shape, so the rows step evenly like brickwork; 'none' keeps each photo's
   *  own shape */
  crop?: '4/5' | 'none'
  /** wall: how much lower every other column starts, as a percentage of a column's width (62.5 is half a 4:5 tile) */
  stagger?: number
  frame?: 'print' | 'plain'
  /** degrees; neighbouring columns (or neighbouring photos in the row) lean opposite ways. 0 for none */
  tilt?: number
  /** wall: each photo fades up as it enters view */
  reveal?: boolean
  /** a two-digit number under each photo, in the order given */
  numbered?: boolean
  /** makes every photo a button; called with the photo's index in `images` */
  onSelect?: (index: number) => void
  /** 'lazy' (the default) loads each photo as it nears the screen; the row always loads its first four at once */
  loading?: 'lazy' | 'eager'
  /** wall: width cap in px (1180 by default) */
  maxWidth?: number
  /** accessible name of the gallery */
  label?: string
  className?: string
}

type TileProps = {
  item: Placed
  crop: '4/5' | 'none'
  frame: 'print' | 'plain'
  tilt: number
  reveal: boolean
  numbered: boolean
  eager: boolean
  onSelect?: (index: number) => void
  className?: string
  style?: CSSProperties
}

function Tile({ item, crop, frame, tilt, reveal, numbered, eager, onSelect, className, style }: TileProps) {
  const [ref, inView] = useInView<HTMLElement>({ rootMargin: '0px 0px -8% 0px' })
  const classes = ['ds-gallery__tile', reveal && inView && 'is-in', className].filter(Boolean).join(' ')
  const photo: ReactNode = (
    <Photo
      image={item.image}
      frame={frame}
      ratio={crop === '4/5' ? '4/5' : 'auto'}
      tilt={tilt || undefined}
      loading={eager ? 'eager' : 'lazy'}
      caption={numbered ? String(item.index + 1).padStart(2, '0') : undefined}
    />
  )
  if (onSelect) {
    const alt = item.image.alt
    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        style={style}
        aria-label={`Open photo${alt ? `: ${alt}` : ` ${item.index + 1}`}`}
        onClick={() => onSelect(item.index)}
      >
        {photo}
      </button>
    )
  }
  return (
    <div ref={ref} className={classes} style={style}>
      {photo}
    </div>
  )
}

const WIDE = '(min-width: 900px)'
const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
function subscribeWide(onChange: () => void) {
  if (!canMatch()) return () => {}
  const mql = window.matchMedia(WIDE)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
/** Whether the screen is wide enough for three columns. Photos are dealt into columns in script, so the count
 *  cannot come from CSS alone; the server (and a browser without matchMedia) renders the wide arrangement. */
const useWide = () => useSyncExternalStore(subscribeWide, () => (canMatch() ? window.matchMedia(WIDE).matches : true), () => true)

/** The row moves sideways under a mouse wheel too, easing into place; at either end the page scrolls on. */
function useSidewaysWheel(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = ref.current
    if (!active || !row) return
    const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = row.scrollLeft
    let raf = 0
    const max = () => row.scrollWidth - row.clientWidth
    const glide = () => {
      const d = target - row.scrollLeft
      if (Math.abs(d) < 0.5) {
        row.scrollLeft = target
        raf = 0
        return
      }
      row.scrollLeft += d * 0.2
      raf = requestAnimationFrame(glide)
    }
    const onScroll = () => {
      if (!raf) target = row.scrollLeft
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // already sideways: the row's own scroll
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? row.clientWidth : 1
      const from = raf ? target : row.scrollLeft
      const next = Math.max(0, Math.min(max(), from + e.deltaY * unit))
      if (next === from) return // at an end: let the page scroll
      e.preventDefault()
      target = next
      if (still) row.scrollLeft = target
      else if (!raf) raf = requestAnimationFrame(glide)
    }
    row.addEventListener('scroll', onScroll, { passive: true })
    row.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      cancelAnimationFrame(raf)
      row.removeEventListener('scroll', onScroll)
      row.removeEventListener('wheel', onWheel)
    }
  }, [active])
  return ref
}

export function Gallery({
  images,
  layout = 'wall',
  columns = 3,
  crop = '4/5',
  stagger = 62.5,
  frame = 'print',
  tilt = 0.6,
  reveal = true,
  numbered = false,
  loading = 'lazy',
  maxWidth,
  onSelect,
  label,
  className,
}: GalleryProps) {
  // the fade is switched on after mount, so photos are never hidden where scripts do not run
  const [armed, setArmed] = useState(false)
  useEffect(() => setArmed(true), [])
  const rowRef = useSidewaysWheel(layout === 'row')
  const wide = useWide()

  const fading = layout === 'wall' && reveal && armed
  const classes = ['ds-gallery', `ds-gallery--${layout}`, fading && 'ds-gallery--reveal', onSelect && 'ds-gallery--open', className]
    .filter(Boolean)
    .join(' ')
  const shared = { crop, frame, reveal: fading, numbered, onSelect }

  if (layout === 'row') {
    return (
      <div className={classes} role="group" aria-label={label}>
        <div className="ds-gallery__scroller" ref={rowRef} tabIndex={0} role="group" aria-label={label ? `${label}, scrolls sideways` : 'Photos, scrolls sideways'}>
          <div className="ds-gallery__belt">
            {images.map((image, index) => {
              const ratio = crop === '4/5' || !image.width || !image.height ? 0.8 : image.width / image.height
              return (
                <Tile
                  key={index}
                  item={{ image, index }}
                  {...shared}
                  tilt={index % 2 ? tilt : -tilt}
                  eager={loading === 'eager' || index < 4}
                  className={index % 2 ? 'ds-gallery__tile--low' : undefined}
                  style={{ '--_ds-gallery-tile-ratio': ratio } as CSSProperties}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const count = columns === 3 && wide ? 3 : 2
  const style = {
    '--_ds-gallery-stagger': `${stagger}%`,
    ...(maxWidth !== undefined && { '--_ds-gallery-max': `${maxWidth}px` }),
  } as CSSProperties
  return (
    <div className={classes} role="group" aria-label={label} style={style}>
      <div className="ds-gallery__wall" data-columns={count}>
        {dealColumns(images, count, crop === '4/5').map((col, c) => (
          <div className="ds-gallery__col" key={c}>
            {col.map((item) => (
              <Tile key={item.index} item={item} {...shared} tilt={c % 2 ? tilt : -tilt} eager={loading === 'eager'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
