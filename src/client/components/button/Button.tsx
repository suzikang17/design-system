import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import './button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'on-photo'
export type ButtonHover = 'none' | 'sheen' | 'wipe'

export type ButtonProps = {
  variant?: ButtonVariant
  hover?: ButtonHover
  href?: string
  target?: string
  rel?: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function Button({ variant = 'primary', hover = 'none', href, children, className, ...rest }: ButtonProps) {
  const classes = ['ds-button', `ds-button--${variant}`, hover !== 'none' && `ds-button--${hover}`, className]
    .filter(Boolean)
    .join(' ')

  if (href !== undefined) {
    // `type` is taken out only so it does not reach the <a>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disabled, type: _type, onClick, ...anchorRest } = rest
    return (
      <a
        {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
        // a disabled link is not a link: no href (so Enter cannot navigate), out of the tab order, no click handler
        href={disabled ? undefined : href}
        tabIndex={disabled ? -1 : undefined}
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : (onClick as unknown as AnchorHTMLAttributes<HTMLAnchorElement>['onClick'])}
      >
        {children}
      </a>
    )
  }
  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  )
}
