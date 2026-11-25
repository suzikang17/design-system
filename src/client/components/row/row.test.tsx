import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Row } from './Row'

const css = readFileSync(join(import.meta.dirname, 'row.css'), 'utf8')

describe('Row', () => {
  it('lays its children side by side with a gap, alignment and spread, and can stay on one line', () => {
    const { container, rerender } = render(
      <Row>
        <span>a</span>
        <span>b</span>
      </Row>,
    )
    expect(container.firstChild).toHaveClass('ds-row', 'ds-row--gap-sm', 'ds-row--align-center', 'ds-row--justify-start')
    expect(container.firstChild).not.toHaveClass('ds-row--nowrap')
    rerender(<Row gap="lg" align="baseline" justify="between" wrap={false} />)
    expect(container.firstChild).toHaveClass('ds-row--gap-lg', 'ds-row--align-baseline', 'ds-row--justify-between', 'ds-row--nowrap')
  })

  it('css: every option has a rule', () => {
    for (const name of ['gap-none', 'gap-xs', 'gap-md', 'gap-lg', 'gap-xl', 'align-start', 'align-center', 'align-end', 'align-stretch', 'align-baseline', 'justify-start', 'justify-center', 'justify-end', 'justify-between', 'nowrap'])
      expect(css).toContain(`.ds-row--${name} `)
    expect(css).toMatch(/flex-flow: row wrap/)
  })

  it('passes other attributes and a class name to its element, and renders with no children', () => {
    const { container, rerender } = render(
      <Row className="mine" data-testid="it" aria-label="Group">
        <span>a</span>
      </Row>,
    )
    expect(screen.getByTestId('it')).toHaveClass('ds-row', 'mine')
    expect(screen.getByTestId('it')).toHaveAttribute('aria-label', 'Group')
    rerender(<Row />)
    expect(container.firstChild).not.toBeNull()
  })

  it('css: tokens only, nothing that moves', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).not.toMatch(/transition|animation/)
  })
})
