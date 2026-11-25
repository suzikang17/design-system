import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { CtaBand } from './CtaBand'

const css = readFileSync(join(import.meta.dirname, 'cta-band.css'), 'utf8')

afterEach(() => vi.unstubAllGlobals())

describe('CtaBand', () => {
  it('renders a section with an h2, the text and a link button', () => {
    const { container } = render(<CtaBand heading="Heading" text="Words" buttonLabel="Go" buttonHref="/go" />)
    expect(container.querySelector('section')).toHaveClass('ds-cta-band--band')
    expect(screen.getByRole('heading', { level: 2, name: 'Heading' })).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/go')
  })

  it('band can carry a second button; mark never does and shows the ornament', () => {
    const { container, rerender } = render(<CtaBand heading="H" buttonLabel="One" secondaryLabel="Two" secondaryHref="/two" />)
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('href', '/two')
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('href', '#')
    expect(container.querySelector('.ds-cta-band__mark')).toBeNull()
    rerender(<CtaBand variant="mark" heading="H" buttonLabel="One" secondaryLabel="Two" />)
    expect(screen.queryByRole('link', { name: 'Two' })).toBeNull()
    expect(container.querySelector('.ds-cta-band__mark')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('section')).toHaveClass('ds-cta-band--mark')
  })

  it('leaves out the text when it is not given', () => {
    const { container } = render(<CtaBand heading="H" buttonLabel="Go" />)
    expect(container.querySelector('.ds-cta-band__text')).toBeNull()
  })

  it('empty values and 300-character values still render', () => {
    const { rerender } = render(<CtaBand heading="" buttonLabel="" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('')
    const long = 'w'.repeat(300)
    rerender(<CtaBand heading={long} text={long} buttonLabel={long} secondaryLabel={long} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(long)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(css).toMatch(/\.ds-cta-band__heading\s*\{[^}]*overflow-wrap:\s*anywhere/)
  })

  it('arms the entrance after mount and waits for the observer; with no observer it is in at once', () => {
    const { container, unmount } = render(<CtaBand heading="H" buttonLabel="Go" />)
    expect(container.firstChild).toHaveClass('is-armed')
    expect(container.firstChild).not.toHaveClass('is-in')
    unmount()
    vi.stubGlobal('IntersectionObserver', undefined)
    expect(render(<CtaBand heading="H" buttonLabel="Go" />).container.firstChild).toHaveClass('is-in')
  })

  it('animate false never hides anything', () => {
    const { container } = render(<CtaBand heading="H" buttonLabel="Go" animate={false} />)
    expect(container.firstChild).not.toHaveClass('is-armed')
  })

  it('two bands on one page keep their own variant and text', () => {
    render(
      <>
        <CtaBand heading="First" buttonLabel="A" />
        <CtaBand variant="mark" heading="Second" buttonLabel="B" />
      </>,
    )
    expect(screen.getByRole('heading', { name: 'First' }).closest('section')).toHaveClass('ds-cta-band--band')
    expect(screen.getByRole('heading', { name: 'Second' }).closest('section')).toHaveClass('ds-cta-band--mark')
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/opacity:\s*1/)
    expect(reduced).toMatch(/transition:\s*none/)
  })
})
