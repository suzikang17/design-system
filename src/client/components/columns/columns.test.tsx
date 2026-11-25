import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Columns } from './Columns'
import { splitShares } from './splitShares'

const css = readFileSync(join(import.meta.dirname, 'columns.css'), 'utf8')

describe('Columns', () => {
  it('reads a split as shares of the width', () => {
    expect(splitShares('1/1')).toEqual([1, 1])
    expect(splitShares('2/1')).toEqual([2, 1])
    expect(splitShares(' 5 / 7 ')).toEqual([5, 7])
    expect(splitShares('1.5/1')).toEqual([1.5, 1])
    for (const bad of [undefined, '', 'a/b', '0/0', '-1', '/']) expect(splitShares(bad)).toEqual([1, 1])
    expect(splitShares(Array(20).fill('1').join('/'))).toHaveLength(12)
    expect(splitShares('1/x/2')).toEqual([1, 2])
  })

  it('sets the split as a grid template, and each child is a column', () => {
    const { container } = render(
      <Columns split="2/1" style={{ color: 'inherit' }}>
        <div>a</div>
        <div>b</div>
      </Columns>,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('ds-columns', 'ds-columns--gap-md', 'ds-columns--start', 'ds-columns--stack-md')
    expect(root.style.getPropertyValue('--_ds-columns-template')).toBe('minmax(0, 2fr) minmax(0, 1fr)')
    expect(root.style.color).toBe('inherit')
    expect(root.querySelector('.ds-columns__grid')?.children).toHaveLength(2)
  })

  it('takes a gap, an alignment, where to stack and the stacked order', () => {
    const { container } = render(<Columns gap="xl" align="center" stackAt="never" reverse />)
    expect(container.firstChild).toHaveClass('ds-columns--gap-xl', 'ds-columns--center', 'ds-columns--stack-never', 'ds-columns--reverse')
  })

  it('two on one page keep their own splits', () => {
    const { container } = render(
      <>
        <Columns split="1/1/1" />
        <Columns split="1/3" />
      </>,
    )
    const [one, two] = Array.from(container.querySelectorAll<HTMLElement>('.ds-columns'))
    expect(one?.style.getPropertyValue('--_ds-columns-template').split(') ').length).toBe(3)
    expect(two?.style.getPropertyValue('--_ds-columns-template')).toBe('minmax(0, 1fr) minmax(0, 3fr)')
  })

  it('css: stacks by its own width at 480, 640 and 900, never for never', () => {
    expect(css).toMatch(/container-type: inline-size/)
    for (const [name, width] of [['sm', '479.98'], ['md', '639.98'], ['lg', '899.98']]) {
      expect(css).toMatch(new RegExp(`@container \\(max-width: ${width}px\\) \\{\\s*\\.ds-columns--stack-${name} `))
    }
    expect(css).not.toContain('stack-never')
    expect(css).toMatch(/column-reverse/)
  })

  it('passes other attributes and a class name to its element, and renders with no children', () => {
    const { container, rerender } = render(
      <Columns className="mine" data-testid="it" aria-label="Group">
        <span>a</span>
      </Columns>,
    )
    expect(screen.getByTestId('it')).toHaveClass('ds-columns', 'mine')
    expect(screen.getByTestId('it')).toHaveAttribute('aria-label', 'Group')
    rerender(<Columns />)
    expect(container.firstChild).not.toBeNull()
  })

  it('css: tokens only, nothing that moves', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).not.toMatch(/transition|animation/)
  })
})
