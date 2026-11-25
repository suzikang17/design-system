import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Chips } from './Chips'

const css = readFileSync(join(import.meta.dirname, 'chips.css'), 'utf8')

describe('Chips', () => {
  it('renders one li per item with --i set to its index', () => {
    const { container } = render(<Chips items={['a', 'b', 'c']} />)
    const lis = container.querySelectorAll('li')
    expect(lis).toHaveLength(3)
    lis.forEach((li, i) => expect(li.style.getPropertyValue('--i')).toBe(String(i)))
    expect(container.querySelector('ul')).toHaveClass('ds-chips')
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<Chips items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('does not throw on a 300-character item', () => {
    const long = 'x'.repeat(300)
    const { container } = render(<Chips items={[long]} stagger />)
    expect(container.querySelector('li')).toHaveTextContent(long)
  })

  it('stagger adds the modifier; is-in arrives under reduced motion or no IO', () => {
    // the shared test setup stubs IntersectionObserver; take it away, so the hook reports in view straight away
    vi.stubGlobal('IntersectionObserver', undefined)
    try {
      const { container } = render(<Chips items={['a']} stagger />)
      expect(container.querySelector('ul')).toHaveClass('ds-chips--stagger')
      expect(container.querySelector('ul')).toHaveClass('is-in')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('without stagger there is no modifier', () => {
    const { container } = render(<Chips items={['a']} />)
    expect(container.querySelector('ul')).not.toHaveClass('ds-chips--stagger')
  })

  it('css: reduced motion removes the lift on hover and the rise animation', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/\.ds-chips--stagger\.is-in \.ds-chip:hover/)
    expect(reduced).toMatch(/animation: none/)
  })

  it('css: 60ms stagger, tokens only, reduced motion handled', () => {
    expect(css).toMatch(/--_ds-chips-step:\s*60ms/)
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion: reduce/)
  })

  it('css: the stagger is capped at the ninth chip (index 8, .52s), so later chips do not wait longer', () => {
    const rule = css.match(/\.ds-chips--stagger\.is-in \.ds-chip\s*{[^}]*}/)?.[0] ?? ''
    expect(rule).toMatch(/animation-delay:\s*calc\(var\(--_ds-chips-base-delay\) \+ var\(--_ds-chips-step\) \* min\(var\(--i, 0\), 8\)\)/)
    expect(css).toMatch(/--_ds-chips-base-delay:\s*40ms/)
  })
})
