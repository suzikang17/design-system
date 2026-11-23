import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Button } from './Button'

const css = readFileSync(join(import.meta.dirname, 'button.css'), 'utf8')

describe('Button', () => {
  it('renders a <button> with default classes', () => {
    render(<Button>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('type', 'button')
    expect(el.className).toBe('ds-button ds-button--primary')
  })

  it('renders an <a> when href is set', () => {
    render(<Button href="/x">Go</Button>)
    const el = screen.getByRole('link', { name: 'Go' })
    expect(el.tagName).toBe('A')
    expect(el).toHaveAttribute('href', '/x')
  })

  it('adds variant and hover classes', () => {
    render(<Button variant="on-photo" hover="wipe">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('ds-button--on-photo', 'ds-button--wipe')
  })

  it('forwards onClick and disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(<Button disabled onClick={onClick}>Go</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders empty children without throwing', () => {
    expect(() => render(<Button>{''}</Button>)).not.toThrow()
  })

  it('renders a 300-character word and the css wraps it anywhere', () => {
    render(<Button>{'x'.repeat(300)}</Button>)
    expect(screen.getByRole('button').textContent).toHaveLength(300)
    expect(css).toMatch(/overflow-wrap:\s*anywhere/)
  })
})

describe('Button as link', () => {
  it('passes target and rel', () => {
    render(<Button href="/x" target="_blank" rel="noopener">Go</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener')
  })

  it('a disabled link has no href, is out of tab order, and ignores clicks and Enter', async () => {
    const onClick = vi.fn()
    render(<Button href="/x" disabled onClick={onClick}>Go</Button>)
    const el = screen.getByText('Go')
    expect(el).not.toHaveAttribute('href')
    expect(el).toHaveAttribute('tabindex', '-1')
    expect(el).toHaveAttribute('aria-disabled', 'true')
    el.focus()
    await userEvent.click(el)
    await userEvent.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('an enabled link keeps href and onClick', async () => {
    const onClick = vi.fn((e: { preventDefault(): void }) => e.preventDefault())
    render(<Button href="/x" onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('link'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('button.css', () => {
  it('has no literal colours or font families', () => {
    expect(findLiterals(css)).toEqual([])
  })

  it('has no literal durations or easings', () => {
    expect(findMotionLiterals(css)).toEqual([])
  })

  it('lets the press rule win over hover', () => {
    expect(css).toMatch(/\.ds-button:hover:active\s*{[^}]*translateY\(0\)/)
  })

  it('turns off transitions and the sheen/wipe under prefers-reduced-motion', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block).toMatch(/\.ds-button\s*{[^}]*transition:\s*none/)
    expect(block).toMatch(/\.ds-button:hover,\s*\.ds-button:hover:active\s*{[^}]*transform:\s*none/)
    expect(block).toMatch(/\.ds-button--sheen::after,\s*\.ds-button--wipe::before\s*{[^}]*display:\s*none/)
  })
})
