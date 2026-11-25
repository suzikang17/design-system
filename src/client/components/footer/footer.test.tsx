import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Footer } from './Footer'

const css = readFileSync(join(import.meta.dirname, 'footer.css'), 'utf8')

describe('Footer', () => {
  it('renders a contentinfo landmark with the small print', () => {
    render(<Footer brand="Studio" year={2030} />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('© 2030 Studio')).toBeInTheDocument()
  })

  it('copyright replaces the default small print', () => {
    render(<Footer brand="Studio" copyright="All rights kept" />)
    expect(screen.getByText('All rights kept')).toBeInTheDocument()
  })

  it('links are real links, labels alone render #', () => {
    render(<Footer links={['Journal', { label: 'Contact', href: '/contact' }]} />)
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '#')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('every social icon is a link with an accessible name; outside links open safely', () => {
    render(
      <Footer
        social={[
          { kind: 'instagram', href: 'https://example.com/i' },
          { kind: 'email', href: 'mailto:a@example.com' },
          { kind: 'link', href: 'https://example.com', label: 'Shop' },
        ]}
      />,
    )
    const ig = screen.getByRole('link', { name: 'Instagram' })
    expect(ig).toHaveAttribute('target', '_blank')
    expect(ig).toHaveAttribute('rel', 'noopener')
    expect(screen.getByRole('link', { name: 'Email' })).not.toHaveAttribute('target')
    expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument()
    expect(document.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has a modifier per variant', () => {
    const { container, rerender } = render(<Footer brand="Studio" tagline="Somewhere" />)
    expect(container.querySelector('footer')).toHaveClass('ds-footer--minimal')
    rerender(<Footer brand="Studio" tagline="Somewhere" variant="row" links={['A']} />)
    expect(container.querySelector('footer')).toHaveClass('ds-footer--row')
    expect(screen.getByText('Somewhere')).toBeInTheDocument()
  })

  it('copes with nothing and with 300 characters', () => {
    const long = 'x'.repeat(300)
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toBeInTheDocument()
    render(<Footer brand={long} tagline={long} links={[long]} variant="row" />)
    expect(screen.getAllByText(long).length).toBeGreaterThan(0)
    expect(css).toMatch(/overflow-wrap:\s*anywhere/)
  })

  it('css: tokens only, reduced motion handled', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion: reduce/)
  })
})
