'use client'

import type { TextareaHTMLAttributes } from 'react'
import { Field, type FieldVariant } from '../input/Field'

export type TextareaProps = {
  label: string
  hint?: string
  error?: string
  variant?: FieldVariant
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ label, hint, error, variant, className, rows = 5, ...rest }: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error} variant={variant}>
      {({ id, describedBy, invalid }) => (
        <textarea
          aria-label={!label && typeof rest.placeholder === 'string' ? rest.placeholder : undefined}
          rows={rows}
          {...rest}
          id={id}
          className={['ds-textarea', className].filter(Boolean).join(' ')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </Field>
  )
}
