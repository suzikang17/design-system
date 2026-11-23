import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Steps } from './Steps'

const css = readFileSync(join(import.meta.dirname, 'steps.css'), 'utf8')

describe('Steps', () => {
  it('renders heading, label and an ordered list of steps, numbered', () => {
    const { container } = render(<Steps eyebrow="label" heading="Heading" steps={['One: first text', { title: 'Two', text: 'second text' }, 'Three']} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Heading' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Heading' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('heading', { level: 3, name: 'One' })).toBeInTheDocument()
    expect(screen.getByText('first text')).toBeInTheDocument()
    expect(screen.getByText('second text')).toBeInTheDocument()
    expect([...container.querySelectorAll('.ds-steps__num')].map((n) => n.textContent)).toEqual(['1', '2', '3'])
  })

  it('splits a string on the first colon only', () => {
    render(<Steps steps={['Title: a: b']} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('a: b')).toBeInTheDocument()
  })

  it('numbered={false} drops the numbers; no heading or label renders neither', () => {
    const { container } = render(<Steps steps={['A: b']} numbered={false} />)
    expect(container.querySelector('.ds-steps__num')).toBeNull()
    expect(container.querySelector('h2')).toBeNull()
    expect(container.querySelector('.ds-eyebrow')).toBeNull()
  })

  it('copes with no steps and with 300-character values', () => {
    const { container, rerender } = render(<Steps steps={[]} heading="H" />)
    expect(container.querySelectorAll('li')).toHaveLength(0)
    const long = 'a'.repeat(300)
    rerender(<Steps eyebrow={long} heading={long} steps={[{ title: long, text: long }]} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(long)
  })

  it('two on one page keep their own headings', () => {
    render(
      <>
        <Steps heading="First" steps={['a']} />
        <Steps heading="Second" steps={['b']} />
      </>,
    )
    expect(screen.getByRole('region', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Second' })).toBeInTheDocument()
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
  })
})
