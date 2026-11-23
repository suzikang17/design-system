import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '../drawer'

// vaul 0.9 passed a null event to its release handler when the pointer left (or
// a long-press menu opened over) the drawer after a press that never moved, and
// threw "Cannot read properties of null (reading 'target')". vaul 1.x guards the
// null event inside onRelease.
describe('Drawer release without a pointer move', () => {
  it('does not throw when the pointer leaves after a press that never moved', async () => {
    // jsdom has no computed transform, which vaul parses while releasing a drag.
    const realGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) =>
      Object.assign(Object.create(realGetComputedStyle(el, pseudo)), { transform: 'matrix(1, 0, 0, 1, 0, 0)' }),
    )
    const errors: unknown[] = []
    const onError = (event: ErrorEvent) => { errors.push(event.error); event.preventDefault() }
    window.addEventListener('error', onError)
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Body</DrawerDescription>
          <button>inside</button>
        </DrawerContent>
      </Drawer>,
    )
    const inside = screen.getByText('inside')
    // jsdom lacks pointer capture, which vaul calls when a press starts a drag.
    for (const el of [inside, inside.parentElement as HTMLElement]) {
      el.setPointerCapture = () => {}
      el.releasePointerCapture = () => {}
    }
    fireEvent.pointerDown(inside, { clientX: 10, clientY: 10, pointerId: 1, button: 0, pointerType: 'touch' })
    fireEvent.pointerOut(inside, { pointerId: 1, pointerType: 'touch' })
    fireEvent.contextMenu(inside)
    // React rethrows event-handler errors on a later tick.
    await new Promise((resolve) => setTimeout(resolve, 20))
    window.removeEventListener('error', onError)
    expect(errors.filter((e) => String((e as Error)?.message).includes("reading 'target'"))).toEqual([])
  })
})
