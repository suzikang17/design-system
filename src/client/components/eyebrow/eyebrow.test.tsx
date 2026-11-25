import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Eyebrow } from './Eyebrow'

const css = readFileSync(join(import.meta.dirname, 'eyebrow.css'), 'utf8')

describe('Eyebrow', () => {
  const originalMM = window.matchMedia
  const originalIO = window.IntersectionObserver
  afterEach(() => {
    window.matchMedia = originalMM
    window.IntersectionObserver = originalIO
  })

  it('renders a <p> by default and a <span> with as', () => {
    const { rerender } = render(<Eyebrow>Label</Eyebrow>)
    expect(screen.getByText('Label').tagName).toBe('P')
    rerender(<Eyebrow as="span">Label</Eyebrow>)
    expect(screen.getByText('Label').tagName).toBe('SPAN')
  })

  it('gets is-in immediately when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    render(<Eyebrow line>Label</Eyebrow>)
    expect(screen.getByText('Label')).toHaveClass('ds-eyebrow', 'ds-eyebrow--line', 'is-in')
  })

  it('waits for the viewport when motion is allowed', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    let cb: ((e: Partial<IntersectionObserverEntry>[]) => void) | undefined
    window.IntersectionObserver = vi.fn(function (c: typeof cb) {
      cb = c
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(), takeRecords: vi.fn() }
    }) as unknown as typeof IntersectionObserver
    render(<Eyebrow line>Label</Eyebrow>)
    expect(screen.getByText('Label')).not.toHaveClass('is-in')
    act(() => cb?.([{ isIntersecting: true }]))
    expect(screen.getByText('Label')).toHaveClass('is-in')
  })

  it('has no line modifier without line', () => {
    render(<Eyebrow>Label</Eyebrow>)
    expect(screen.getByText('Label')).not.toHaveClass('ds-eyebrow--line')
  })

  it('css: 38px line, tokens only, reduced motion handled', () => {
    expect(css).toMatch(/38px/)
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion: reduce/)
  })
})
