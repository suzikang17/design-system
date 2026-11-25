import { useState } from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInView } from './useInView'

type Entries = Partial<IntersectionObserverEntry>[]

function Probe({ once }: { once?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once, rootMargin: '10px' })
  return (
    <div ref={ref} data-testid="probe">
      {String(inView)}
    </div>
  )
}

describe('useInView', () => {
  const originalIO = window.IntersectionObserver
  const originalMM = window.matchMedia

  afterEach(() => {
    window.IntersectionObserver = originalIO
    window.matchMedia = originalMM
  })

  function mockIO() {
    const s = {
      cb: undefined as ((e: Entries) => void) | undefined,
      options: undefined as IntersectionObserverInit | undefined,
      disconnect: vi.fn(),
    }
    window.IntersectionObserver = vi.fn(function (cb: (e: Entries) => void, options?: IntersectionObserverInit) {
      s.cb = cb
      s.options = options
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: s.disconnect, takeRecords: vi.fn() }
    }) as unknown as typeof IntersectionObserver
    return s
  }

  it('is true immediately when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const { result } = renderHook(() => useInView<HTMLDivElement>())
    expect(result.current[1]).toBe(true)
  })

  it('is true immediately when IntersectionObserver is unavailable', () => {
    // @ts-expect-error simulating an environment without IntersectionObserver
    delete window.IntersectionObserver
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('true')
  })

  it('flips to true on intersection, passes rootMargin, and disconnects when once', () => {
    const io = mockIO()
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('false')
    expect(io.options?.rootMargin).toBe('10px')
    act(() => io.cb?.([{ isIntersecting: true }]))
    expect(screen.getByTestId('probe')).toHaveTextContent('true')
    expect(io.disconnect).toHaveBeenCalled()
  })

  it('tracks leaving the viewport when once is false', () => {
    const io = mockIO()
    render(<Probe once={false} />)
    act(() => io.cb?.([{ isIntersecting: true }]))
    expect(screen.getByTestId('probe')).toHaveTextContent('true')
    act(() => io.cb?.([{ isIntersecting: false }]))
    expect(screen.getByTestId('probe')).toHaveTextContent('false')
  })

  it('does not report in view while the ref has no node, and observes once the node attaches', () => {
    const io = mockIO()
    function Late() {
      const [show, setShow] = useState(false)
      const [ref, inView] = useInView<HTMLDivElement>()
      return (
        <>
          <button onClick={() => setShow(true)}>show</button>
          {show && <div ref={ref} data-testid="late">{String(inView)}</div>}
          <span data-testid="flag">{String(inView)}</span>
        </>
      )
    }
    render(<Late />)
    expect(screen.getByTestId('flag')).toHaveTextContent('false')
    expect(io.cb).toBeUndefined()
    act(() => screen.getByText('show').click())
    expect(io.cb).toBeDefined()
    expect(screen.getByTestId('late')).toHaveTextContent('false')
    act(() => io.cb?.([{ isIntersecting: true }]))
    expect(screen.getByTestId('late')).toHaveTextContent('true')
  })
})
