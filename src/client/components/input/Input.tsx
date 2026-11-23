'use client'

import type { InputHTMLAttributes } from 'react'
import { Field, type FieldVariant } from './Field'

export type InputProps = {
  label: string
  hint?: string
  error?: string
  variant?: FieldVariant
} & InputHTMLAttributes<HTMLInputElement>

export function Input({ label, hint, error, variant, className, ...rest }: InputProps) {
  return (
    <Field label={label} hint={hint} error={error} variant={variant}>
      {({ id, describedBy, invalid }) => (
        <input
          aria-label={!label && typeof rest.placeholder === 'string' ? rest.placeholder : undefined}
          {...rest}
          id={id}
          className={['ds-input', className].filter(Boolean).join(' ')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </Field>
  )
}
