import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Input } from './Input'
import { Textarea } from '../textarea/Textarea'

const css = readFileSync(join(import.meta.dirname, 'input.css'), 'utf8')

describe('Input', () => {
  it('associates the label with the control', () => {
    render(<Input label="Name" />)
    expect(screen.getByLabelText('Name')).toHaveClass('ds-input')
  })

  it('error sets aria-invalid and aria-describedby pointing at the alert', () => {
    render(<Input label="Name" error="Required" />)
    const el = screen.getByLabelText('Name')
    expect(el).toHaveAttribute('aria-invalid', 'true')
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Required')
    expect(el.getAttribute('aria-describedby')).toContain(alert.id)
  })

  it('hint is described too, and no error means not invalid', () => {
    render(<Input label="Name" hint="As on your ID" />)
    const el = screen.getByLabelText('Name')
    expect(el).not.toHaveAttribute('aria-invalid')
    expect(el.getAttribute('aria-describedby')).toBe(screen.getByText('As on your ID').id)
  })

  it('two inputs get different ids', () => {
    render(<><Input label="A" /><Input label="B" /></>)
    expect(screen.getByLabelText('A').id).not.toBe(screen.getByLabelText('B').id)
  })

  it('label="" renders no label element and falls back to aria-label from placeholder', () => {
    const { container } = render(<Input label="" placeholder="Your name" />)
    expect(container.querySelector('label')).toBeNull()
    expect(screen.getByLabelText('Your name')).toHaveClass('ds-input')
  })

  it('forwards props', () => {
    render(<Input label="Name" name="n" disabled />)
    expect(screen.getByLabelText('Name')).toBeDisabled()
    expect(screen.getByLabelText('Name')).toHaveAttribute('name', 'n')
  })

  it('accepts typing', async () => {
    render(<Input label="Name" />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
  })

  it('defaults to the box variant; variant="line" switches the class', () => {
    const { container, rerender } = render(<Input label="Name" />)
    expect(container.firstElementChild).toHaveClass('ds-field--box')
    rerender(<Input label="Name" variant="line" />)
    expect(container.firstElementChild).toHaveClass('ds-field--line')
    expect(container.firstElementChild).not.toHaveClass('ds-field--box')
  })

  it('still shows a visible label when given one', () => {
    const { container } = render(<Input label="Name" variant="line" />)
    expect(container.querySelector('label')).toHaveTextContent('Name')
  })
})

describe('Textarea', () => {
  it('is labelled, invalid with error, and typeable', async () => {
    render(<Textarea label="Message" error="Too short" />)
    const el = screen.getByLabelText('Message')
    expect(el.tagName).toBe('TEXTAREA')
    expect(el).toHaveClass('ds-textarea')
    expect(el).toHaveAttribute('aria-invalid', 'true')
    expect(el.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id)
    await userEvent.type(el, 'hi')
    expect(el).toHaveValue('hi')
  })

  it('takes the variant', () => {
    const { container } = render(<Textarea label="M" variant="line" />)
    expect(container.firstElementChild).toHaveClass('ds-field--line')
  })

  it('label="" falls back to the placeholder', () => {
    const { container } = render(<Textarea label="" placeholder="Tell us" />)
    expect(container.querySelector('label')).toBeNull()
    expect(screen.getByLabelText('Tell us')).toBeInTheDocument()
  })
})

describe('input.css', () => {
  it('has no literal colours, fonts, durations or easings', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
  })
  it('placeholders and field text use the field face (falling back to mono for older themes)', () => {
    expect(css).toMatch(/::placeholder\s*{[^}]*font-family:\s*var\(--ds-font-field, var\(--ds-font-mono\)\)/)
    expect(css).toMatch(/\.ds-field\s*{[^}]*font-family:\s*var\(--ds-font-field, var\(--ds-font-mono\)\)/)
  })
  it('focus is a border colour change, with no ring in the box variant', () => {
    expect(css).toMatch(/\.ds-input:focus,\s*\.ds-textarea:focus\s*{\s*border-color/)
    expect(css).not.toMatch(/ds-field--box[^{]*:focus\s*{[^}]*box-shadow/)
  })
  it('turns transitions off under prefers-reduced-motion', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block).toMatch(/transition:\s*none/)
  })
})
