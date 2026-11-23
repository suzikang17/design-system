import { render } from '@testing-library/react'
import { StrictMode, version } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { allMeta } from '@/client/catalog/registry'
import type { ComponentMeta } from '@/client/catalog/meta'
import { Photo } from '@/client/components/photo/Photo'

// The client pieces must work on React 18 and 19; this repo runs 18. Every catalogued piece renders with its own
// defaults (what a first visit to its page shows), its home card props and each value of its select and boolean
// options, in StrictMode, without React complaining: no unknown DOM props, invalid nesting, missing keys or
// controlled/uncontrolled warnings.
describe('client pieces on React 18', () => {
  let errors: ReturnType<typeof vi.spyOn>
  let warns: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errors = vi.spyOn(console, 'error')
    warns = vi.spyOn(console, 'warn')
  })
  afterEach(() => {
    errors.mockRestore()
    warns.mockRestore()
  })

  const renderQuietly = (m: ComponentMeta<object>, props: object) => {
    const Component = m.component
    const { container, unmount } = render(
      <StrictMode>
        <Component {...props} />
      </StrictMode>,
    )
    expect(container.firstChild).not.toBeNull()
    unmount()
    expect(errors).not.toHaveBeenCalled()
    expect(warns).not.toHaveBeenCalled()
  }

  it('runs on React 18', () => {
    expect(version).toMatch(/^18\./)
  })

  it('finds all seventeen pieces', () => {
    expect(allMeta).toHaveLength(17)
  })

  it.each(allMeta.map((m) => [m.id, m] as const))('%s with its defaults', (_id, m) => {
    renderQuietly(m, m.defaults)
  })

  it.each(allMeta.filter((m) => m.cardProps).map((m) => [m.id, m] as const))('%s with its home card props', (_id, m) => {
    renderQuietly(m, { ...m.defaults, ...m.cardProps })
  })

  it.each(allMeta.map((m) => [m.id, m] as const))('%s with each select and boolean option', (_id, m) => {
    for (const [key, control] of Object.entries(m.controls as Record<string, { type: string; options?: readonly string[] }>)) {
      const values = control.type === 'select' ? (control.options ?? []) : control.type === 'boolean' ? [true, false] : []
      for (const value of values) renderQuietly(m, { ...m.defaults, [key]: value })
    }
  })

  it('Photo sets fetchpriority without the React 19 prop name', () => {
    const image = { src: '/placeholders/portrait-1.jpg', alt: '', width: 3, height: 4 }
    const { container } = render(<Photo image={image} fetchPriority="high" />)
    expect(container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
    expect(errors).not.toHaveBeenCalled()
    expect(warns).not.toHaveBeenCalled()
  })
})
