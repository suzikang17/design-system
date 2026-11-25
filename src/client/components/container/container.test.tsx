import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Container } from './Container'

const css = readFileSync(join(import.meta.dirname, 'container.css'), 'utf8')

describe('Container', () => {
  it('is a page-width container with gutters by default, and takes a width, no gutters and section spacing', () => {
    const { container, rerender } = render(<Container>hi</Container>)
    expect(container.firstChild).toHaveClass('ds-container', 'ds-container--page')
    expect(container.firstChild).not.toHaveClass('ds-container--flush', 'ds-container--pad')
    rerender(<Container width="text" gutter={false} pad>hi</Container>)
    expect(container.firstChild).toHaveClass('ds-container--text', 'ds-container--flush', 'ds-container--pad')
  })

  it('css: the cap and the gutters are the ones the sections use', () => {
    expect(css).toMatch(/--_ds-container-max: 1180px/)
    expect(css).toMatch(/padding-inline: var\(--ds-gutter\)/)
    expect(css).toMatch(/padding-block: var\(--ds-space-section\)/)
  })

  it('passes other attributes and a class name to its element, and renders with no children', () => {
    const { container, rerender } = render(
      <Container className="mine" data-testid="it" aria-label="Group">
        <span>a</span>
      </Container>,
    )
    expect(screen.getByTestId('it')).toHaveClass('ds-container', 'mine')
    expect(screen.getByTestId('it')).toHaveAttribute('aria-label', 'Group')
    rerender(<Container />)
    expect(container.firstChild).not.toBeNull()
  })

  it('css: tokens only, nothing that moves', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).not.toMatch(/transition|animation/)
  })
})
