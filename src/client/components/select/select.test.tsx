import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Select } from './Select'

const css = readFileSync(join(import.meta.dirname, 'select.css'), 'utf8')
const OPTS = ['Residential', 'Hospitality', 'Something else']
const hidden = (c: HTMLElement) => c.querySelector('input[type="hidden"]') as HTMLInputElement

describe('Select', () => {
  it('is a collapsed listbox button named by its label, showing the label as placeholder', () => {
    render(<Select label="Type of project" options={OPTS} />)
    const btn = screen.getByRole('button', { name: 'Type of project' })
    expect(btn).toHaveAttribute('aria-haspopup', 'listbox')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).toHaveTextContent('Type of project')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('shows the placeholder prop instead of the label, but is still named by the label', () => {
    render(<Select label="Type of project" placeholder="Choose one" options={OPTS} />)
    const btn = screen.getByRole('button', { name: 'Type of project' })
    expect(btn).toHaveTextContent('Choose one')
  })

  it('opens on click and sets aria-expanded', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getAllByRole('option')[0]).toHaveFocus()
  })

  it('ArrowDown on the button opens it; ArrowDown then Enter chooses, closes, calls onChange, fills the hidden input', async () => {
    const onChange = vi.fn()
    const { container } = render(<Select label="Type" name="type" options={OPTS} onChange={onChange} />)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('Residential')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button')).toHaveFocus()
    expect(screen.getByRole('button')).toHaveTextContent('Residential')
    expect(hidden(container)).toHaveValue('Residential')
    expect(hidden(container)).toHaveAttribute('name', 'type')
  })

  it('Enter and Space on the closed button open it', async () => {
    render(<Select label="Type" options={OPTS} />)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard(' ')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('arrows move focus between options without wrapping; Space chooses', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(screen.getAllByRole('option')[2]).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getAllByRole('option')[1]).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('button')).toHaveTextContent('Hospitality')
  })

  it('Home and End jump to the first and last option', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.keyboard('{End}')
    expect(screen.getAllByRole('option')[2]).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(screen.getAllByRole('option')[0]).toHaveFocus()
  })

  it('typing a letter moves to the next option starting with it', async () => {
    render(<Select label="Type" options={['Apple', 'Banana', 'Blueberry', 'Cherry']} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.keyboard('b')
    expect(screen.getAllByRole('option')[1]).toHaveFocus()
    await userEvent.keyboard('b')
    expect(screen.getAllByRole('option')[2]).toHaveFocus()
    await userEvent.keyboard('b')
    expect(screen.getAllByRole('option')[1]).toHaveFocus()
  })

  it('Escape closes and returns focus to the button', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('Escape that closes an open list is default-prevented, so an enclosing <dialog> does not also cancel', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    const option = screen.getAllByRole('option')[0]!
    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    option.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
  })

  it('Escape on a closed Select is left alone, so an enclosing <dialog> can close', () => {
    render(<Select label="Type" options={OPTS} />)
    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    screen.getByRole('button').dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })

  it('Tab from an open list closes it and moves on', async () => {
    render(<><Select label="Type" options={OPTS} /><button type="button">After</button></>)
    await userEvent.click(screen.getByRole('button', { name: 'Type' }))
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Type' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('click outside closes', async () => {
    render(<><Select label="Type" options={OPTS} /><p>elsewhere</p></>)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByText('elsewhere'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking an option chooses it and marks only it aria-selected', async () => {
    render(<Select label="Type" options={OPTS} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Hospitality' }))
    await userEvent.click(screen.getByRole('button'))
    const sel = screen.getAllByRole('option').map((o) => o.getAttribute('aria-selected'))
    expect(sel).toEqual(['false', 'true', 'false'])
    expect(screen.getAllByRole('option')[1]).toHaveFocus()
  })

  it('works uncontrolled with defaultValue', () => {
    const { container } = render(<Select label="Type" options={OPTS} defaultValue="Hospitality" name="t" />)
    expect(screen.getByRole('button')).toHaveTextContent('Hospitality')
    expect(hidden(container)).toHaveValue('Hospitality')
  })

  it('works controlled: shows value, calls onChange, follows the parent', async () => {
    function Host() {
      const [v, setV] = useState('Residential')
      return (
        <>
          <Select label="Type" options={OPTS} value={v} onChange={setV} />
          <output>{v}</output>
        </>
      )
    }
    render(<Host />)
    expect(screen.getByRole('button')).toHaveTextContent('Residential')
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Something else' }))
    expect(screen.getByRole('status')).toHaveTextContent('Something else')
    expect(screen.getByRole('button')).toHaveTextContent('Something else')
  })

  it('a controlled value that the parent does not update stays put', async () => {
    render(<Select label="Type" options={OPTS} value="Residential" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Hospitality' }))
    expect(screen.getByRole('button')).toHaveTextContent('Residential')
  })

  it('two Selects: each aria-labelledby resolves to its own label, and choosing in one leaves the other alone', async () => {
    const { container } = render(
      <>
        <Select label="Type of project" name="a" options={OPTS} />
        <Select label="Timing" name="b" options={['Soon', 'Later']} />
      </>,
    )
    const [a, b] = screen.getAllByRole('button')
    const nameOf = (el: HTMLElement) =>
      el.getAttribute('aria-labelledby')!.split(' ').map((id) => container.ownerDocument.getElementById(id)!.textContent).join(' ')
    expect(nameOf(a!)).toBe('Type of project')
    expect(nameOf(b!)).toBe('Timing')
    await userEvent.click(a!)
    await userEvent.click(b!)
    expect(a).toHaveAttribute('aria-expanded', 'false')
    expect(b).toHaveAttribute('aria-expanded', 'true')
    const listB = screen.getByRole('listbox')
    expect(listB.getAttribute('aria-labelledby')).toBe(b!.getAttribute('aria-labelledby')!.split(' ')[0])
    await userEvent.click(within(listB).getByRole('option', { name: 'Later' }))
    expect(b).toHaveTextContent('Later')
    expect(a).toHaveTextContent('Type of project')
    const [ha, hb] = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')
    expect(ha).toHaveValue('')
    expect(hb).toHaveValue('Later')
    expect(screen.getByRole('button', { name: /Later/ })).toBe(b)
  })

  it('options={[]} renders a disabled button that does not open', async () => {
    render(<Select label="Type" options={[]} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('defaults to the box variant; variant="line" switches the class', () => {
    const { container, rerender } = render(<Select label="Type" options={OPTS} />)
    expect(container.firstElementChild).toHaveClass('ds-field', 'ds-field--box')
    rerender(<Select label="Type" options={OPTS} variant="line" />)
    expect(container.firstElementChild).toHaveClass('ds-field--line')
  })

  it('renders a 300-character option without throwing', async () => {
    render(<Select label="Type" options={['x'.repeat(300)]} />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('option').textContent).toHaveLength(300)
  })
})

describe('select.css', () => {
  it('has no literal colours, font families, durations or easings', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
  })

  it('turns the chevron transition off under prefers-reduced-motion', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block).toMatch(/\.ds-select__chevron\s*{[^}]*transition:\s*none/)
  })
})
