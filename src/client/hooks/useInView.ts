import { useEffect, useState } from 'react'

export type UseInViewOptions = { once?: boolean; rootMargin?: string; threshold?: number }

/**
 * Reports whether the element given the returned (callback) ref is in the viewport.
 * Returns true straight away when the visitor prefers reduced motion or IntersectionObserver is missing,
 * so content is never hidden waiting for an observer that cannot fire. `once` (default true) latches.
 */
export function useInView<T extends Element>(options: UseInViewOptions = {}): [(node: T | null) => void, boolean] {
  const { once = true, rootMargin, threshold } = options
  // callback ref held in state, so the effect re-runs when the node mounts, changes or unmounts
  const [node, setNode] = useState<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof window.IntersectionObserver !== 'function') {
      setInView(true)
      return
    }
    // no node yet is not "in view": wait for the ref to attach
    if (!node) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) io.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [node, once, rootMargin, threshold])

  return [setNode, inView]
}
