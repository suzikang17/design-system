import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Photo, type Img } from './Photo'

const css = readFileSync(join(import.meta.dirname, 'photo.css'), 'utf8')
const image: Img = { src: '/p.jpg', alt: 'A quiet street', width: 1200, height: 1600 }

describe('Photo', () => {
  it('renders a figure with the plain frame by default', () => {
    const { container } = render(<Photo image={image} />)
    const fig = container.querySelector('figure')!
    expect(fig).toHaveClass('ds-photo', 'ds-photo--plain')
  })

  it.each(['plain', 'print', 'mat', 'cameo', 'arch'] as const)('frame %s sets its modifier class', (frame) => {
    const { container } = render(<Photo image={image} frame={frame} />)
    expect(container.querySelector('figure')).toHaveClass(`ds-photo--${frame}`)
  })

  it('img carries alt, width, height and decoding', () => {
    render(<Photo image={image} />)
    const img = screen.getByRole('img', { name: 'A quiet street' })
    expect(img).toHaveAttribute('alt', 'A quiet street')
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '1600')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('loading defaults to lazy and can be eager', () => {
    const { container, rerender } = render(<Photo image={image} />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    rerender(<Photo image={image} loading="eager" />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager')
  })

  it('tilt sets --_ds-photo-tilt in degrees on the figure', () => {
    const { container } = render(<Photo image={image} frame="print" tilt={1.5} />)
    expect(container.querySelector('figure')!.style.getPropertyValue('--_ds-photo-tilt')).toBe('1.5deg')
  })

  it('no tilt sets no --_ds-photo-tilt', () => {
    const { container } = render(<Photo image={image} />)
    expect(container.querySelector('figure')!.style.getPropertyValue('--_ds-photo-tilt')).toBe('')
  })

  it('empty alt yields alt="" (decorative), never a missing attribute', () => {
    const { container } = render(<Photo image={{ ...image, alt: '' }} />)
    const img = container.querySelector('img')!
    expect(img.hasAttribute('alt')).toBe(true)
    expect(img.getAttribute('alt')).toBe('')
  })

  it('ratio and hoverZoom set classes and the ratio variable', () => {
    const { container } = render(<Photo image={image} ratio="3/2" hoverZoom />)
    const fig = container.querySelector('figure')!
    expect(fig).toHaveClass('ds-photo--zoom', 'ds-photo--fixed')
    expect(fig.style.getPropertyValue('--_ds-photo-ratio')).toBe('3/2')
  })

  it('ratio auto uses the image own proportions and does not crop', () => {
    const { container } = render(<Photo image={image} ratio="auto" />)
    const fig = container.querySelector('figure')!
    expect(fig).not.toHaveClass('ds-photo--fixed')
    expect(fig.style.getPropertyValue('--_ds-photo-ratio')).toBe('1200/1600')
  })

  it('passes srcSet and sizes through', () => {
    const { container } = render(<Photo image={{ ...image, srcSet: '/p.jpg 1x' }} sizes="50vw" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('srcset', '/p.jpg 1x')
    expect(img).toHaveAttribute('sizes', '50vw')
  })

  it('fills its container unless maxWidth is given', () => {
    const { container, rerender } = render(<Photo image={image} />)
    expect(container.querySelector('figure')!.style.getPropertyValue('--_ds-photo-width')).toBe('')
    rerender(<Photo image={image} maxWidth={360} />)
    expect(container.querySelector('figure')!.style.getPropertyValue('--_ds-photo-width')).toBe('360px')
    rerender(<Photo image={image} maxWidth="20rem" />)
    expect(container.querySelector('figure')!.style.getPropertyValue('--_ds-photo-width')).toBe('20rem')
  })

  it('print mat and matSize set modifiers only on the print frame', () => {
    const { container, rerender } = render(<Photo image={image} frame="print" mat="white" matSize="small" />)
    expect(container.querySelector('figure')).toHaveClass('ds-photo--white', 'ds-photo--small')
    rerender(<Photo image={image} frame="print" />)
    expect(container.querySelector('figure')).not.toHaveClass('ds-photo--white', 'ds-photo--small')
    rerender(<Photo image={image} frame="plain" mat="white" matSize="small" />)
    expect(container.querySelector('figure')).not.toHaveClass('ds-photo--white')
  })

  it('renders a caption and passes fetchPriority', () => {
    const { container } = render(<Photo image={image} caption="Morning light" fetchPriority="high" />)
    expect(container.querySelector('figcaption.ds-photo__caption')).toHaveTextContent('Morning light')
    expect(container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
  })

  it('has no caption element without a caption', () => {
    const { container } = render(<Photo image={image} />)
    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    // the white mat and the deckle masks are component values now, not theme tokens
    expect(css).toMatch(/--_ds-photo-white:\s*#ffffff;\s*\/\*\s*ds-allow-literal:/)
    expect(css).toMatch(/--_ds-photo-deckle:\s*url\("data:image\/svg\+xml/)
    expect(css).toMatch(/--_ds-photo-deckle-sm:\s*url\("data:image\/svg\+xml/)
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
  })
})
