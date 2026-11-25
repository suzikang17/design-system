import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { TextLink } from './TextLink'

const css = readFileSync(join(import.meta.dirname, 'text-link.css'), 'utf8')

describe('TextLink', () => {
  it('renders an anchor with the base class', () => {
    render(<TextLink href="/x">Book</TextLink>)
    const a = screen.getByRole('link', { name: 'Book' })
    expect(a).toHaveAttribute('href', '/x')
    expect(a).toHaveClass('ds-textlink')
  })

  it('arrow span is aria-hidden and not in the accessible name', () => {
    const { container } = render(
      <TextLink href="/x" arrow>
        Book
      </TextLink>,
    )
    const span = container.querySelector('.ds-textlink__arrow')
    expect(span).toHaveAttribute('aria-hidden', 'true')
    expect(span).toHaveTextContent('⟶')
    expect(screen.getByRole('link', { name: 'Book' })).toBeInTheDocument()
  })

  it('has no arrow by default and adds the grow modifier', () => {
    const { container } = render(
      <TextLink href="/x" underline="grow">
        Book
      </TextLink>,
    )
    expect(container.querySelector('.ds-textlink__arrow')).toBeNull()
    expect(screen.getByRole('link')).toHaveClass('ds-textlink--grow')
  })

  it.each(['javascript:alert(1)', 'JavaScript:alert(1)', ' \tjava\nscript:alert(1)', 'data:text/html,x', 'vbscript:x', '\u0001javascript:x'])(
    'renders %j as an inert link without href',
    (href) => {
      const { container } = render(<TextLink href={href}>Bad</TextLink>)
      const a = container.querySelector('a')!
      expect(a).not.toHaveAttribute('href')
    },
  )

  it.each(['/path', 'https://example.com', 'mailto:a@b.co', '#top', 'datasheet.html'])('keeps safe href %s', (href) => {
    const { container } = render(<TextLink href={href}>Ok</TextLink>)
    expect(container.querySelector('a')).toHaveAttribute('href', href)
  })

  it('css uses tokens only', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion: reduce/)
  })
})
