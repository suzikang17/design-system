'use client'

import type { ChangeEvent, CompositionEvent } from 'react'
import { Input, type InputProps } from '../input/Input'

/** US numbers format as you type: (858) 555-0123, with a leading 1 kept as "+1 " once the number runs past ten
 *  digits. Anything starting with + (other than +1), or longer than a US number, is left as typed apart from
 *  stray characters. Ported from initPhone in the We Curate Life contact script. */
// the formatter ships beside the component so a copied-out project gets both from one file
// eslint-disable-next-line react-refresh/only-export-components
export function formatPhone(raw: string): string {
  const stray = /[^\d+ ()-]/g
  const trimmed = raw.trim()
  if (trimmed.startsWith('+') && !trimmed.startsWith('+1')) return raw.replace(stray, '')
  let d = raw.replace(/\D/g, '')
  let cc = ''
  if (d.length > 10 && d.startsWith('1')) {
    cc = '+1 '
    d = d.slice(1)
  }
  if (d.length > 10) return raw.replace(stray, '')
  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6)
  return cc + (d.length > 6 ? `(${a}) ${b}-${c}` : d.length > 3 ? `(${a}) ${b}` : d.length ? `(${a}` : '')
}

const digitCount = (s: string) => s.replace(/\D/g, '').length

/** Index just after the nth digit of `s` (0 when n is 0). */
function indexAfterDigits(s: string, n: number): number {
  if (n <= 0) return 0
  let seen = 0
  for (let i = 0; i < s.length; i++) {
    if (/\d/.test(s[i]!) && ++seen === n) return i + 1
  }
  return s.length
}

export type PhoneInputProps = Omit<InputProps, 'type' | 'inputMode'>

export function PhoneInput({ onChange, onCompositionEnd, defaultValue, ...rest }: PhoneInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const el = e.currentTarget
    const inputType = (e.nativeEvent as InputEvent).inputType
    // deleting and IME composition are left alone (backspace works through brackets; composition must not be reset)
    if (!inputType?.startsWith('delete') && !(e.nativeEvent as InputEvent).isComposing) {
      const raw = el.value
      const formatted = formatPhone(raw)
      if (formatted !== raw) {
        const caret = el.selectionStart ?? raw.length
        const atEnd = caret >= raw.length
        const before = digitCount(raw.slice(0, caret))
        el.value = formatted
        // the source jumps to the end; keep the caret after the same digit when editing mid-number
        const next = atEnd ? formatted.length : indexAfterDigits(formatted, before)
        el.setSelectionRange(next, next)
      }
    }
    onChange?.(e)
  }

  // input during a composition is left alone above, so format once it ends. The value goes in through the native
  // setter plus an input event, so React reports it as an ordinary change (a controlled parent sees it too).
  function handleCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    const el = e.currentTarget
    const formatted = formatPhone(el.value)
    if (formatted !== el.value) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, formatted)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.setSelectionRange(formatted.length, formatted.length)
    }
    onCompositionEnd?.(e)
  }

  return (
    <Input
      {...rest}
      type="tel"
      inputMode="tel"
      defaultValue={typeof defaultValue === 'string' ? formatPhone(defaultValue) : defaultValue}
      onChange={handleChange}
      onCompositionEnd={handleCompositionEnd}
    />
  )
}
