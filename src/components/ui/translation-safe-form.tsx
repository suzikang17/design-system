import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * TranslationSafeForm - A form wrapper that prevents browser translation from breaking form functionality
 *
 * Browser translation tools (like Google Translate) can modify the DOM in ways that break React's
 * virtual DOM reconciliation, event handlers, and form validation. This component adds multiple
 * layers of protection:
 *
 * 1. translate="no" attribute - Tells browsers not to translate this element
 * 2. notranslate class - Google-specific class to prevent translation
 * 3. lang attribute - Explicitly sets the language to prevent auto-detection
 *
 * IMPORTANT: This ONLY blocks browser translation tools (Chrome Translate, etc.)
 * Your i18n translations (react-i18next) will continue to work normally because they
 * use React state/props, not DOM manipulation.
 *
 * Usage:
 * <TranslationSafeForm onSubmit={handleSubmit}>
 *   <Input name="email" />
 *   <Button type="submit">{t('submit')}</Button> (i18n still works)
 * </TranslationSafeForm>
 */

interface TranslationSafeFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  className?: string
}

export const TranslationSafeForm = React.forwardRef<HTMLFormElement, TranslationSafeFormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        translate="no"
        className={cn("notranslate", className)}
        lang="en"
        {...props}
      >
        {children}
      </form>
    )
  }
)

TranslationSafeForm.displayName = "TranslationSafeForm"

/**
 * TranslationSafeInput - An input wrapper that prevents translation
 * Use this for critical form inputs that should never be translated
 */
interface TranslationSafeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const TranslationSafeInput = React.forwardRef<HTMLInputElement, TranslationSafeInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        translate="no"
        className={cn("notranslate", className)}
        {...props}
      />
    )
  }
)

TranslationSafeInput.displayName = "TranslationSafeInput"

/**
 * TranslationSafeDiv - A div wrapper that prevents translation of its contents
 * Use this to wrap form sections or interactive components
 */
interface TranslationSafeDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const TranslationSafeDiv = React.forwardRef<HTMLDivElement, TranslationSafeDivProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        translate="no"
        className={cn("notranslate", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TranslationSafeDiv.displayName = "TranslationSafeDiv"

