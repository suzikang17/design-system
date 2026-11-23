'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { FieldVariant } from '../input/Field'
import '../input/input.css'
import './select.css'

export type SelectProps = {
  /** Accessible name. Also the text shown in the closed button until a value is chosen, unless `placeholder` is set. */
  label: string
  options: string[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Name of the hidden input that carries the value in a form. */
  name?: string
  placeholder?: string
  variant?: FieldVariant
}

/** A button that opens a listbox of choices. Ported from the We Curate Life contact form (initDropdowns):
 *  focus moves onto the options themselves, Enter/Space choose, Esc closes and returns focus to the button. */
export function Select({ label, options, value, defaultValue = '', onChange, name, placeholder, variant = 'box' }: SelectProps) {
  const uid = useId()
  const labelId = `${uid}-label`
  const valueId = `${uid}-value`
  const listId = `${uid}-list`
  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const disabled = options.length === 0

  const focusOption = (i: number) => items.current[Math.max(0, Math.min(options.length - 1, i))]?.focus()

  // The panel is rendered (hidden) all the time, so focus can move in once the open state has painted.
  useEffect(() => {
    if (!open) return
    const sel = options.indexOf(current)
    items.current[sel >= 0 ? sel : 0]?.focus()
    // only on opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const away = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const pick = (v: string) => {
    if (value === undefined) setInner(v)
    onChange?.(v)
    setOpen(false)
    button.current?.focus()
  }

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onOptionKey = (e: KeyboardEvent, i: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        return focusOption(i + 1)
      case 'ArrowUp':
        e.preventDefault()
        return focusOption(i - 1)
      case 'Home':
        e.preventDefault()
        return focusOption(0)
      case 'End':
        e.preventDefault()
        return focusOption(options.length - 1)
      case 'Enter':
      case ' ':
        e.preventDefault()
        return pick(options[i]!)
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        return button.current?.focus()
      case 'Tab':
        // close, and let the Tab carry on from the button
        setOpen(false)
        return button.current?.focus()
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const c = e.key.toLowerCase()
          for (let step = 1; step <= options.length; step++) {
            const j = (i + step) % options.length
            if (options[j]!.toLowerCase().startsWith(c)) return focusOption(j)
          }
        }
    }
  }

  const chosen = current !== ''
  const classes = ['ds-field', `ds-field--${variant}`, 'ds-select', open && 'is-open', chosen && 'is-chosen'].filter(Boolean).join(' ')

  return (
    <div ref={root} className={classes}>
      <span id={labelId} className="ds-select__label">
        {label || placeholder}
      </span>
      <input type="hidden" name={name} value={current} />
      <button
        ref={button}
        type="button"
        className="ds-select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={chosen ? `${labelId} ${valueId}` : labelId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        <span id={valueId} className="ds-select__value">
          {chosen ? current : (placeholder || label)}
        </span>
        <svg className="ds-select__chevron" width="16" height="10" viewBox="0 0 16 10" aria-hidden="true" focusable="false">
          <path d="M1 1l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
      <ul id={listId} className="ds-select__panel" role="listbox" aria-labelledby={labelId} hidden={!open}>
        {options.map((o, i) => (
          <li
            key={`${i}-${o}`}
            ref={(el) => {
              items.current[i] = el
            }}
            className="ds-select__option"
            role="option"
            tabIndex={-1}
            aria-selected={o === current}
            onClick={() => pick(o)}
            onKeyDown={(e) => onOptionKey(e, i)}
          >
            {o}
          </li>
        ))}
      </ul>
    </div>
  )
}
