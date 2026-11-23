import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { NavBar } from './NavBar'

const css = readFileSync(join(import.meta.dirname, 'nav-bar.css'), 'utf8')
const links = ['About', { label: 'Contact', href: '/contact' }]

describe('NavBar', () => {
  it('renders a banner with the brand, the links and a labelled navigation', () => {
    render(<NavBar brand="Studio" links={links} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Studio' })).toHaveAttribute('href', '#')
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Contact', hidden: true })[0]).toHaveAttribute('href', '/contact')
    expect(screen.getAllByRole('link', { name: 'About', hidden: true })[0]).toHaveAttribute('href', '#')
  })

  it('marks the current page, and shows the button only with a label', () => {
    const { rerender, container } = render(<NavBar brand="Studio" links={links} current="About" />)
    expect(container.querySelector('.ds-navbar__links a[aria-current="page"]')).toHaveTextContent('About')
    expect(container.querySelector('.ds-navbar__cta')).toBeNull()
    rerender(<NavBar brand="Studio" links={links} cta="Book" ctaHref="/book" variant="menu" />)
    expect(container.querySelector('.ds-navbar__cta')).toHaveAttribute('href', '/book')
    expect(container.querySelector('.ds-navbar')).toHaveClass('ds-navbar--menu')
  })

  it('is not fixed, and sticky is opt-in', () => {
    const { container, rerender } = render(<NavBar brand="Studio" links={links} />)
    expect(container.querySelector('.ds-navbar')).not.toHaveClass('ds-navbar--sticky')
    expect(css).not.toMatch(/position:\s*fixed/)
    rerender(<NavBar brand="Studio" links={links} sticky />)
    expect(container.querySelector('.ds-navbar')).toHaveClass('ds-navbar--sticky')
  })

  it('the menu button toggles the panel, with aria-expanded, and Escape closes it', () => {
    render(<NavBar brand="Studio" links={links} />)
    const btn = screen.getByRole('button', { name: 'Open menu' })
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(panel).toHaveAttribute('hidden')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(panel).not.toHaveAttribute('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).toHaveFocus()
  })

  it('choosing a link, or pressing outside, closes the menu', () => {
    render(<NavBar brand="Studio" links={links} />)
    const btn = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(btn)
    fireEvent.click(document.querySelector('.ds-navbar__panel-links a')!)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    fireEvent.mouseDown(document.body)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('two bars on one page keep their own menus and ids', () => {
    render(
      <>
        <NavBar brand="One" links={links} />
        <NavBar brand="Two" links={links} />
      </>,
    )
    const [a, b] = screen.getAllByRole('button')
    expect(a.getAttribute('aria-controls')).not.toBe(b.getAttribute('aria-controls'))
    fireEvent.click(a)
    expect(a).toHaveAttribute('aria-expanded', 'true')
    expect(b).toHaveAttribute('aria-expanded', 'false')
  })

  it('copes with nothing and with 300 characters', () => {
    const long = 'x'.repeat(300)
    const { container } = render(<NavBar brand="" links={[]} />)
    expect(container.querySelector('.ds-navbar')).toBeInTheDocument()
    render(<NavBar brand={long} links={[long]} cta={long} />)
    expect(screen.getAllByText(long).length).toBeGreaterThan(0)
    expect(css).toMatch(/overflow-wrap:\s*anywhere/)
  })

  it('css: tokens only, reduced motion handled', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion: reduce/)
  })
})
