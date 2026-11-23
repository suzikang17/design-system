import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import type { Img } from '../photo/Photo'
import { dealColumns } from './dealColumns'
import { Gallery } from './Gallery'

const css = readFileSync(join(import.meta.dirname, 'gallery.css'), 'utf8')
const tall = (n: number): Img => ({ src: `/t${n}.jpg`, alt: `Tall ${n}`, width: 1200, height: 1600 })
const wide = (n: number): Img => ({ src: `/w${n}.jpg`, alt: `Wide ${n}`, width: 1800, height: 1200 })
const six = [tall(1), wide(2), tall(3), wide(4), tall(5), wide(6)]
const indexes = (cols: { index: number }[][]) => cols.map((c) => c.map((x) => x.index))

describe('dealColumns', () => {
  it('reads across when every tile is the same shape', () => {
    expect(indexes(dealColumns(six, 3, true))).toEqual([[0, 3], [1, 4], [2, 5]])
    expect(indexes(dealColumns(six, 2, true))).toEqual([[0, 2, 4], [1, 3, 5]])
  })

  it('puts each photo in the shortest column when shapes are kept', () => {
    // tall (1.33) left, wide (0.67) right, then the right column is shorter twice running
    expect(indexes(dealColumns([tall(1), wide(2), wide(3), wide(4)], 2, false))).toEqual([[0, 3], [1, 2]])
  })

  it('keeps every photo exactly once and copes with none, and with a missing size', () => {
    expect(dealColumns(six, 3, false).flat().map((x) => x.index).sort()).toEqual([0, 1, 2, 3, 4, 5])
    expect(dealColumns([], 3, true)).toEqual([[], [], []])
    expect(indexes(dealColumns([{ ...tall(1), width: 0, height: 0 }, tall(2)], 2, false))).toEqual([[0], [1]])
  })
})

describe('Gallery', () => {
  const screenIs = (wide: boolean) =>
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: wide, media: query, addEventListener: () => {}, removeEventListener: () => {} }))

  it('wall deals the photos once: three columns on a wide screen, two on a narrow one', () => {
    screenIs(true)
    const { container, unmount } = render(<Gallery images={six} />)
    expect(container.querySelector('.ds-gallery')).toHaveClass('ds-gallery--wall')
    expect(container.querySelectorAll('.ds-gallery__col')).toHaveLength(3)
    expect(container.querySelectorAll('img')).toHaveLength(6)
    unmount()
    screenIs(false)
    const narrow = render(<Gallery images={six} />)
    expect(narrow.container.querySelectorAll('.ds-gallery__col')).toHaveLength(2)
    expect(narrow.container.querySelectorAll('img')).toHaveLength(6)
    vi.unstubAllGlobals()
  })

  it('columns 2 stays at two columns on a wide screen, and maxWidth caps the wall', () => {
    screenIs(true)
    const { container } = render(<Gallery images={six} columns={2} maxWidth={640} />)
    expect(container.querySelectorAll('.ds-gallery__col')).toHaveLength(2)
    expect((container.querySelector('.ds-gallery') as HTMLElement).style.getPropertyValue('--_ds-gallery-max')).toBe('640px')
    vi.unstubAllGlobals()
  })

  it('stagger sets the offset of every other column as a percentage', () => {
    const { container } = render(<Gallery images={six} stagger={30} />)
    expect((container.querySelector('.ds-gallery') as HTMLElement).style.getPropertyValue('--_ds-gallery-stagger')).toBe('30%')
    expect(css).toMatch(/\.ds-gallery__col:nth-child\(even\)\s*\{\s*padding-block-start:\s*var\(--_ds-gallery-stagger\)/)
  })

  it('neighbouring columns lean opposite ways, and tilt 0 sets no lean', () => {
    const { container, rerender } = render(<Gallery images={six} columns={2} tilt={0.6} />)
    const cols = container.querySelectorAll('.ds-gallery__col')
    expect((cols[0].querySelector('figure') as HTMLElement).style.getPropertyValue('--_ds-photo-tilt')).toBe('-0.6deg')
    expect((cols[1].querySelector('figure') as HTMLElement).style.getPropertyValue('--_ds-photo-tilt')).toBe('0.6deg')
    rerender(<Gallery images={six} columns={2} tilt={0} />)
    expect((container.querySelector('figure') as HTMLElement).style.getPropertyValue('--_ds-photo-tilt')).toBe('')
  })

  it('crop 4/5 gives every tile the same shape; none keeps each photo own shape', () => {
    const { container, rerender } = render(<Gallery images={six} columns={2} />)
    for (const fig of container.querySelectorAll('figure')) expect((fig as HTMLElement).style.getPropertyValue('--_ds-photo-ratio')).toBe('4/5')
    rerender(<Gallery images={six} columns={2} crop="none" />)
    const ratios = [...container.querySelectorAll('figure')].map((f) => (f as HTMLElement).style.getPropertyValue('--_ds-photo-ratio'))
    expect(new Set(ratios)).toEqual(new Set(['1200/1600', '1800/1200']))
  })

  it('frame is passed to every photo', () => {
    const { container, rerender } = render(<Gallery images={six} columns={2} />)
    expect(container.querySelector('figure')).toHaveClass('ds-photo--print')
    rerender(<Gallery images={six} columns={2} frame="plain" />)
    expect(container.querySelector('figure')).toHaveClass('ds-photo--plain')
  })

  it('row renders one sideways scroller, in order, every other photo lower and leaning the other way', () => {
    const { container } = render(<Gallery images={six} layout="row" crop="none" label="Kitchen" />)
    expect(container.querySelector('.ds-gallery')).toHaveClass('ds-gallery--row')
    const scroller = screen.getByRole('group', { name: 'Kitchen, scrolls sideways' })
    expect(scroller).toHaveAttribute('tabindex', '0')
    const tiles = [...container.querySelectorAll<HTMLElement>('.ds-gallery__tile')]
    expect(tiles.map((t) => t.querySelector('img')!.getAttribute('alt'))).toEqual(six.map((i) => i.alt))
    expect(tiles.map((t) => t.classList.contains('ds-gallery__tile--low'))).toEqual([false, true, false, true, false, true])
    expect(tiles[0].style.getPropertyValue('--_ds-gallery-tile-ratio')).toBe('0.75')
    expect(tiles[1].style.getPropertyValue('--_ds-gallery-tile-ratio')).toBe('1.5')
    expect(tiles[0].querySelector('figure')!.style.getPropertyValue('--_ds-photo-tilt')).toBe('-0.6deg')
    expect(tiles[1].querySelector('figure')!.style.getPropertyValue('--_ds-photo-tilt')).toBe('0.6deg')
  })

  it('a vertical wheel over the row is taken only while the row can move that way', () => {
    const { container } = render(<Gallery images={six} layout="row" />)
    const row = container.querySelector('.ds-gallery__scroller') as HTMLElement
    Object.defineProperty(row, 'scrollWidth', { value: 2000, configurable: true })
    Object.defineProperty(row, 'clientWidth', { value: 500, configurable: true })
    const wheel = (init: WheelEventInit) => {
      const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
      row.dispatchEvent(e)
      return e.defaultPrevented
    }
    expect(wheel({ deltaY: -50 })).toBe(false) // at the start, scrolling back: the page scrolls
    expect(wheel({ deltaY: 50, ctrlKey: true })).toBe(false) // pinch-zoom
    expect(wheel({ deltaX: 80, deltaY: 10 })).toBe(false) // already sideways
    expect(wheel({ deltaY: 50 })).toBe(true)
  })

  it('without onSelect the photos are not buttons', () => {
    render(<Gallery images={six} columns={2} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('onSelect makes every photo a named button that reports its index', () => {
    const onSelect = vi.fn()
    render(<Gallery images={[tall(1), { ...wide(2), alt: '' }]} columns={2} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open photo: Tall 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open photo 2' }))
    expect(onSelect.mock.calls).toEqual([[0], [1]])
  })

  it('numbered puts a two-digit number under each photo, in the order given', () => {
    const { container } = render(<Gallery images={six} layout="row" numbered />)
    expect([...container.querySelectorAll('figcaption')].map((c) => c.textContent)).toEqual(['01', '02', '03', '04', '05', '06'])
  })

  it('reveal arms the fade on the wall only; photos show at once where IntersectionObserver is missing', () => {
    // the shared test setup stubs IntersectionObserver; take it away, so the hook reports in view straight away
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container, rerender } = render(<Gallery images={six} columns={2} />)
    expect(container.querySelector('.ds-gallery')).toHaveClass('ds-gallery--reveal')
    for (const tile of container.querySelectorAll('.ds-gallery__tile')) expect(tile).toHaveClass('is-in')
    rerender(<Gallery images={six} columns={2} reveal={false} />)
    expect(container.querySelector('.ds-gallery')).not.toHaveClass('ds-gallery--reveal')
    rerender(<Gallery images={six} layout="row" />)
    expect(container.querySelector('.ds-gallery')).not.toHaveClass('ds-gallery--reveal')
    vi.unstubAllGlobals()
  })

  it('a photo waits out of view until the observer reports it', () => {
    const { container } = render(<Gallery images={six} columns={2} />)
    expect(container.querySelector('.ds-gallery')).toHaveClass('ds-gallery--reveal')
    expect(container.querySelector('.ds-gallery__tile')).not.toHaveClass('is-in')
  })

  it('renders nothing broken with no photos, with one, and with a 300-character alt', () => {
    const { container, rerender } = render(<Gallery images={[]} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    rerender(<Gallery images={[]} layout="row" />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    const long = 'a'.repeat(300)
    rerender(<Gallery images={[{ ...tall(1), alt: long }]} columns={2} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: `Open photo: ${long}` })).toBeInTheDocument()
  })

  it('two galleries on one page keep their own layout and label', () => {
    render(
      <>
        <Gallery images={six} columns={2} label="First" />
        <Gallery images={six} layout="row" label="Second" />
      </>,
    )
    expect(screen.getByRole('group', { name: 'First' })).toHaveClass('ds-gallery--wall')
    expect(screen.getByRole('group', { name: 'Second' })).toHaveClass('ds-gallery--row')
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
  })
})
