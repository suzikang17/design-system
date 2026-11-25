import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Grid } from './Grid'

const css = readFileSync(join(import.meta.dirname, 'grid.css'), 'utf8')

describe('Grid', () => {
  it('sets the most columns and the narrowest column, with a gap and an alignment', () => {
    const { container, rerender } = render(
      <Grid>
        <div>a</div>
        <div>b</div>
      </Grid>,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('ds-grid', 'ds-grid--gap-md', 'ds-grid--stretch')
    expect(root.style.getPropertyValue('--_ds-grid-columns')).toBe('3')
    expect(root.style.getPropertyValue('--_ds-grid-min')).toBe('220px')
    rerender(<Grid columns={4} min={160} gap="xs" align="start" />)
    expect(root.style.getPropertyValue('--_ds-grid-columns')).toBe('4')
    expect(root.style.getPropertyValue('--_ds-grid-min')).toBe('160px')
    expect(root).toHaveClass('ds-grid--gap-xs', 'ds-grid--start')
  })

  it('holds unusable numbers to something that draws', () => {
    const { container, rerender } = render(<Grid columns={0} min={-5} />)
    const root = container.firstChild as HTMLElement
    expect(root.style.getPropertyValue('--_ds-grid-columns')).toBe('1')
    expect(root.style.getPropertyValue('--_ds-grid-min')).toBe('0px')
    rerender(<Grid columns={99} min={Number.NaN} />)
    expect(root.style.getPropertyValue('--_ds-grid-columns')).toBe('12')
    expect(root.style.getPropertyValue('--_ds-grid-min')).toBe('0px')
  })

  it('css: never more than the columns asked for, never wider than itself', () => {
    expect(css).toMatch(/repeat\(auto-fill, minmax\(min\(100%, max\(var\(--_ds-grid-min\), var\(--_ds-grid-share\)\)\), 1fr\)\)/)
  })

  it('passes other attributes and a class name to its element, and renders with no children', () => {
    const { container, rerender } = render(
      <Grid className="mine" data-testid="it" aria-label="Group">
        <span>a</span>
      </Grid>,
    )
    expect(screen.getByTestId('it')).toHaveClass('ds-grid', 'mine')
    expect(screen.getByTestId('it')).toHaveAttribute('aria-label', 'Group')
    rerender(<Grid />)
    expect(container.firstChild).not.toBeNull()
  })

  it('css: tokens only, nothing that moves', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).not.toMatch(/transition|animation/)
  })
})
