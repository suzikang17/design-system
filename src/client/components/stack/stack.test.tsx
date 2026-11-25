import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Stack } from './Stack'

const css = readFileSync(join(import.meta.dirname, 'stack.css'), 'utf8')

describe('Stack', () => {
  it('stacks its children with a gap and an alignment', () => {
    const { container, rerender } = render(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>,
    )
    expect(container.firstChild).toHaveClass('ds-stack', 'ds-stack--gap-md', 'ds-stack--stretch')
    expect(container.firstChild?.childNodes).toHaveLength(2)
    rerender(<Stack gap="xl" align="center" />)
    expect(container.firstChild).toHaveClass('ds-stack--gap-xl', 'ds-stack--center')
  })

  it('css: every gap step and alignment has a rule', () => {
    for (const name of ['gap-none', 'gap-xs', 'gap-sm', 'gap-lg', 'gap-xl', 'stretch', 'start', 'center', 'end']) expect(css).toContain(`.ds-stack--${name} `)
    expect(css).toMatch(/flex-direction: column/)
  })

  it('passes other attributes and a class name to its element, and renders with no children', () => {
    const { container, rerender } = render(
      <Stack className="mine" data-testid="it" aria-label="Group">
        <span>a</span>
      </Stack>,
    )
    expect(screen.getByTestId('it')).toHaveClass('ds-stack', 'mine')
    expect(screen.getByTestId('it')).toHaveAttribute('aria-label', 'Group')
    rerender(<Stack />)
    expect(container.firstChild).not.toBeNull()
  })

  it('css: tokens only, nothing that moves', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).not.toMatch(/transition|animation/)
  })
})
