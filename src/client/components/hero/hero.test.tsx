import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import type { Img } from '../photo/Photo'
import { Hero } from './Hero'

const css = readFileSync(join(import.meta.dirname, 'hero.css'), 'utf8')
const image: Img = { src: '/p.jpg', alt: 'A photo', width: 1200, height: 1600 }

afterEach(() => vi.unstubAllGlobals())

describe('Hero', () => {
  it('renders a section with the title as its heading, the text, a link button and the photo', () => {
    const { container } = render(<Hero eyebrow="Label" title="Title" text="Words" ctaLabel="Go" ctaHref="/go" image={image} />)
    expect(container.querySelector('section')).toHaveClass('ds-hero--split')
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/go')
    expect(screen.getByAltText('A photo')).toHaveAttribute('loading', 'eager')
  })

  it('wordmark puts the eyebrow as a line under the title and keeps the same parts', () => {
    const { container } = render(<Hero variant="wordmark" eyebrow="A line" title="Title" text="Words" ctaLabel="Go" image={image} />)
    expect(container.querySelector('section')).toHaveClass('ds-hero--wordmark')
    expect(container.querySelector('.ds-hero__line')).toHaveTextContent('A line')
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#')
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it('leaves out what is not given: no image, text or button', () => {
    for (const variant of ['split', 'wordmark'] as const) {
      const { container, unmount } = render(<Hero variant={variant} title="Only a title" />)
      expect(container.querySelectorAll('img')).toHaveLength(0)
      expect(screen.queryByRole('link')).toBeNull()
      expect(container.querySelector('.ds-hero__text')).toBeNull()
      unmount()
    }
  })

  it('an empty title and a 300-character title still render', () => {
    const { container, rerender } = render(<Hero title="" />)
    expect(container.querySelector('h1')).toHaveTextContent('')
    const long = 'w'.repeat(300)
    rerender(<Hero title={long} text={long} eyebrow={long} ctaLabel={long} image={image} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(long)
    expect(css).toMatch(/\.ds-hero__title\s*\{[^}]*overflow-wrap:\s*anywhere/)
  })

  it('minHeight (a number is px) sets the least height; the default never reads the window height', () => {
    const { container, rerender } = render(<Hero title="T" minHeight={300} />)
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--_ds-hero-min')).toBe('300px')
    rerender(<Hero title="T" minHeight="40rem" />)
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--_ds-hero-min')).toBe('40rem')
    rerender(<Hero title="T" />)
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--_ds-hero-min')).toBe('')
    expect(css).not.toMatch(/\d(?:vh|svh|dvh|lvh)\b/)
  })

  it('arms the entrance after mount and waits for the observer; with no observer it is in at once', () => {
    const { container, unmount } = render(<Hero title="T" />)
    expect(container.firstChild).toHaveClass('is-armed')
    expect(container.firstChild).not.toHaveClass('is-in')
    unmount()
    vi.stubGlobal('IntersectionObserver', undefined)
    const again = render(<Hero title="T" />)
    expect(again.container.firstChild).toHaveClass('is-in')
  })

  it('animate false never hides anything', () => {
    const { container } = render(<Hero title="T" animate={false} />)
    expect(container.firstChild).not.toHaveClass('is-armed')
  })

  it('two heroes on one page keep their own variant', () => {
    const { container } = render(
      <>
        <Hero title="One" />
        <Hero variant="wordmark" title="Two" />
      </>,
    )
    const sections = container.querySelectorAll('section')
    expect(sections[0]).toHaveClass('ds-hero--split')
    expect(sections[1]).toHaveClass('ds-hero--wordmark')
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/opacity:\s*1/)
    expect(reduced).toMatch(/transition:\s*none/)
  })
})
