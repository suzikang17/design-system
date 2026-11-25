import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Faq } from './Faq'

const css = readFileSync(join(import.meta.dirname, 'faq.css'), 'utf8')
const items = ['First question? First answer.', { question: 'Second question?', answer: 'Second answer.' }, 'Third? Third answer.']

describe('Faq', () => {
  it('renders heading, label and a button per question, all closed', () => {
    render(<Faq eyebrow="label" heading="Heading" items={items} />)
    expect(screen.getByRole('region', { name: 'Heading' })).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual(['First question?+', 'Second question?+', 'Third?+'])
    for (const b of buttons) expect(b).toHaveAttribute('aria-expanded', 'false')
  })

  it('splits "Question? Answer" after the first question mark', () => {
    render(<Faq items={['What? Is it? Yes.']} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('region', { name: /What\?/ })).toHaveTextContent('Is it? Yes.')
  })

  it('a click opens an answer, sets aria-expanded and a named region; a second click closes it', () => {
    render(<Faq items={items} />)
    const b = screen.getByRole('button', { name: /First question/ })
    expect(screen.queryByRole('region', { name: /First question/ })).toBeNull()
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: /First question/ })).toHaveTextContent('First answer.')
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'false')
  })

  it('is operable from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Faq items={items} />)
    await user.tab()
    expect(screen.getAllByRole('button')[0]).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-expanded', 'false')
  })

  it('single (default) keeps one open; single={false} lets several stay open', () => {
    const { rerender } = render(<Faq items={items} />)
    const open = () => screen.getAllByRole('button').map((b) => b.getAttribute('aria-expanded'))
    fireEvent.click(screen.getAllByRole('button')[0])
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(open()).toEqual(['false', 'true', 'false'])
    rerender(<Faq items={items} single={false} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(open()).toEqual(['true', 'true', 'false'])
  })

  it('closed answers carry no visibility but hide through css (visibility:hidden), open ones show', () => {
    expect(css).toMatch(/\.ds-faq__wrap\s*\{[^}]*visibility:\s*hidden/)
    expect(css).toMatch(/\.is-open > \.ds-faq__wrap\s*\{[^}]*visibility:\s*visible/)
  })

  it('copes with no items, a question with no answer, and 300-character values', () => {
    const { container, rerender } = render(<Faq items={[]} heading="H" />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    rerender(<Faq items={['No answer here']} />)
    expect(screen.getByRole('button')).toHaveTextContent('No answer here')
    const long = 'a'.repeat(300)
    rerender(<Faq heading={long} items={[{ question: long, answer: long }]} />)
    expect(screen.getByRole('button')).toHaveTextContent(long)
  })

  it('two on one page do not share open state or ids', () => {
    const { container } = render(
      <>
        <Faq heading="A" items={items} />
        <Faq heading="B" items={items} />
      </>,
    )
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false', 'false', 'false', 'false'])
    const ids = [...container.querySelectorAll('[id]')].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('css reads tokens only and turns motion off for reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
  })
})
