'use client'

import { useId, type ReactNode } from 'react'
import './input.css'

export type FieldVariant = 'box' | 'line'

export type FieldProps = {
  label: string
  variant?: FieldVariant
  hint?: string
  error?: string
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/** Label, control, hint and error wired together. An empty label renders no <label> at all. */
export function Field({ label, hint, error, variant = 'box', className, children }: FieldProps) {
  const uid = useId()
  const id = `${uid}-control`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={['ds-field', `ds-field--${variant}`, error && 'ds-field--invalid', className].filter(Boolean).join(' ')}>
      {label ? (
        <label className="ds-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p className="ds-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ds-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
