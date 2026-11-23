import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { formatPhone, PhoneInput } from './PhoneInput'

describe('formatPhone (derived from initPhone in the source)', () => {
  it.each([
    ['8585550123', '(858) 555-0123'],
    ['858', '(858'],
    ['858555', '(858) 555'],
    ['8585', '(858) 5'],
    ['', ''],
    ['18585550123', '+1 (858) 555-0123'],
    ['+1 (858) 555-0123', '+1 (858) 555-0123'],
    ['+44 20 7946 0958', '+44 20 7946 0958'],
    ['+44 20 7946 0958x', '+44 20 7946 0958'],
    ['858-555-0123abc', '(858) 555-0123'],
    ['123456789012', '123456789012'],
    ['85855501234', '85855501234'],
    ['  +44 1', '  +44 1'],
  ])('%j -> %j', (raw, out) => {
    expect(formatPhone(raw)).toBe(out)
  })

  it('source quirk kept: a lone leading 1 is not treated as a country code until the number is longer than 10 digits', () => {
    expect(formatPhone('1858')).toBe('(185) 8')
  })
})

describe('PhoneInput', () => {
  it('is a labelled tel input with the tel keyboard', () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText('Phone')
    expect(el).toHaveAttribute('type', 'tel')
    expect(el).toHaveAttribute('inputmode', 'tel')
    expect(el).toHaveClass('ds-input')
  })

  it('uncontrolled: typing shows the formatted value', async () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText('Phone')
    await userEvent.type(el, '8585550123')
    expect(el).toHaveValue('(858) 555-0123')
  })

  it('uncontrolled: defaultValue is formatted', () => {
    render(<PhoneInput label="Phone" defaultValue="8585550123" />)
    expect(screen.getByLabelText('Phone')).toHaveValue('(858) 555-0123')
  })

  it('controlled: onChange receives the formatted value', async () => {
    const seen: string[] = []
    function Host() {
      const [v, setV] = useState('')
      return <PhoneInput label="Phone" value={v} onChange={(e) => { seen.push(e.target.value); setV(e.target.value) }} />
    }
    render(<Host />)
    const el = screen.getByLabelText('Phone')
    await userEvent.type(el, '18585550123')
    expect(el).toHaveValue('+1 (858) 555-0123')
    expect(seen.at(-1)).toBe('+1 (858) 555-0123')
  })

  it('controlled value is shown as given', () => {
    render(<PhoneInput label="Phone" value="(858" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Phone')).toHaveValue('(858')
  })

  it('backspace works through the brackets and spaces', async () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText('Phone')
    await userEvent.type(el, '858555')
    expect(el).toHaveValue('(858) 555')
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}')
    expect(el).toHaveValue('(858)')
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}')
    expect(el).toHaveValue('')
  })

  it('typing in the middle keeps the caret after the typed digit', async () => {
    render(<PhoneInput label="Phone" defaultValue="(858) 55" />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    el.focus()
    el.setSelectionRange(3, 3)
    await userEvent.keyboard('9')
    expect(el).toHaveValue('(859) 855')
    expect(el.selectionStart).toBe(4)
  })

  it('deleting in the middle does not move the caret to the end', async () => {
    render(<PhoneInput label="Phone" defaultValue="(858) 555-0123" />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    el.focus()
    el.setSelectionRange(3, 3)
    await userEvent.keyboard('{Backspace}')
    expect(el.selectionStart).toBe(2)
  })

  it('forwards error to aria-invalid', () => {
    render(<PhoneInput label="Phone" error="Invalid" />)
    expect(screen.getByLabelText('Phone')).toHaveAttribute('aria-invalid', 'true')
  })

  it('paste formats the pasted digits', async () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText('Phone')
    await userEvent.click(el)
    await userEvent.paste('858-555-0123')
    expect(el).toHaveValue('(858) 555-0123')
  })

  it('select-all then type replaces the number', async () => {
    render(<PhoneInput label="Phone" defaultValue="8585550123" />)
    const el = screen.getByLabelText('Phone')
    await userEvent.click(el)
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.keyboard('4155')
    expect(el).toHaveValue('(415) 5')
  })

  it('controlled: mid-number typing keeps the caret after the typed digit', async () => {
    function Host() {
      const [v, setV] = useState('(858) 55')
      return <PhoneInput label="Phone" value={v} onChange={(e) => setV(e.target.value)} />
    }
    render(<Host />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    el.focus()
    el.setSelectionRange(3, 3)
    await userEvent.keyboard('9')
    expect(el).toHaveValue('(859) 855')
    expect(el.selectionStart).toBe(4)
  })

  it('does not reformat while an IME composition is in progress', () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    fireEvent.input(el, { target: { value: '8585' }, isComposing: true })
    expect(el).toHaveValue('8585')
  })

  it('formats once the IME composition ends (uncontrolled)', () => {
    render(<PhoneInput label="Phone" />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    fireEvent.compositionStart(el)
    fireEvent.input(el, { target: { value: '8585550123' }, isComposing: true })
    expect(el).toHaveValue('8585550123')
    fireEvent.compositionEnd(el)
    expect(el).toHaveValue('(858) 555-0123')
  })

  it('formats once the IME composition ends (controlled, onChange sees the formatted value)', () => {
    const seen: string[] = []
    function Host() {
      const [v, setV] = useState('')
      return (
        <PhoneInput
          label="Phone"
          value={v}
          onChange={(e) => {
            seen.push(e.target.value)
            setV(e.target.value)
          }}
        />
      )
    }
    render(<Host />)
    const el = screen.getByLabelText<HTMLInputElement>('Phone')
    fireEvent.compositionStart(el)
    fireEvent.input(el, { target: { value: '8585550123' }, isComposing: true })
    expect(el).toHaveValue('8585550123')
    fireEvent.compositionEnd(el)
    expect(el).toHaveValue('(858) 555-0123')
    expect(seen.at(-1)).toBe('(858) 555-0123')
  })

  it('still calls a passed onCompositionEnd', () => {
    const spy = vi.fn()
    render(<PhoneInput label="Phone" onCompositionEnd={spy} />)
    fireEvent.compositionEnd(screen.getByLabelText('Phone'))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
