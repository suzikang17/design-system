import { version, type CSSProperties, type ReactNode } from 'react'
import './photo.css'

// React 19 knows `fetchPriority` and writes the `fetchpriority` attribute; React 18 does not know the camelCase
// prop (it warns and drops it) but passes the lowercase attribute through as is. Same attribute on both.
const FETCH_PRIORITY_PROP = Number(version.split('.')[0]) >= 19 ? 'fetchPriority' : 'fetchpriority'

export type Img = { src: string; alt: string; width: number; height: number; srcSet?: string }

export type PhotoFrame = 'plain' | 'print' | 'mat' | 'cameo' | 'arch'
export type PhotoRatio = '3/4' | '4/5' | '1/1' | '3/2' | 'auto'

export type PhotoProps = {
  image: Img
  frame?: PhotoFrame
  /** 'auto' keeps the image's own proportions; the others crop to fit */
  ratio?: PhotoRatio
  /** the photo grows slightly inside its frame on hover (devices with hover, motion allowed) */
  hoverZoom?: boolean
  /** degrees; any frame can sit askew */
  tilt?: number
  /** print frame: the paper around the photo, the site's plate colour or pure white */
  mat?: 'plate' | 'white'
  /** print frame: regular or the smaller mat and finer torn edge */
  matSize?: 'regular' | 'small'
  /** display width cap (px number or CSS length); by default the figure fills its container */
  maxWidth?: number | string
  caption?: ReactNode
  sizes?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
  className?: string
}

export function Photo({
  image,
  frame = 'plain',
  ratio = 'auto',
  hoverZoom = false,
  tilt,
  mat = 'plate',
  matSize = 'regular',
  maxWidth,
  caption,
  sizes,
  fetchPriority,
  loading = 'lazy',
  className,
}: PhotoProps) {
  const fixed = ratio !== 'auto'
  const classes = ['ds-photo', `ds-photo--${frame}`, fixed && 'ds-photo--fixed', frame === 'print' && mat === 'white' && 'ds-photo--white', frame === 'print' && matSize === 'small' && 'ds-photo--small', hoverZoom && 'ds-photo--zoom', className]
    .filter(Boolean)
    .join(' ')
  const style = {
    ...(maxWidth !== undefined && { '--_ds-photo-width': typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }),
    '--_ds-photo-ratio': fixed ? ratio : `${image.width}/${image.height}`,
    ...(tilt !== undefined && { '--_ds-photo-tilt': `${tilt}deg` }),
  } as CSSProperties
  return (
    <figure className={classes} style={style}>
      <span className="ds-photo__well">
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={loading}
          {...(fetchPriority !== undefined && { [FETCH_PRIORITY_PROP]: fetchPriority })}
          decoding="async"
        />
      </span>
      {caption !== undefined && caption !== null && <figcaption className="ds-photo__caption">{caption}</figcaption>}
    </figure>
  )
}
