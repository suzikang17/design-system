import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { findLiterals, findMotionLiterals } from '@/client/tokens/lint'
import { Modal } from './Modal'

const css = readFileSync(join(import.meta.dirname, 'modal.css'), 'utf8')

/** The platform fires `cancel` on Escape; jsdom does not, so the test fires it. */
const pressEscape = (dialog: HTMLElement) => {
  const ev = new Event('cancel', { cancelable: true })
  fireEvent(dialog, ev)
  return ev
}

describe('Modal', () => {
  it('is not in the accessibility tree when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Saved">Body</Modal>)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows a dialog named by its title when open', () => {
    render(<Modal open onClose={() => {}} title="Saved">Body</Modal>)
    expect(screen.getByRole('dialog', { name: 'Saved' })).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeVisible()
  })

  it('opens and closes the native dialog as `open` changes', () => {
    const { rerender } = render(<Modal open={false} onClose={() => {}} title="T">x</Modal>)
    expect(screen.queryByRole('dialog')).toBeNull()
    rerender(<Modal open onClose={() => {}} title="T">x</Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('open')
    rerender(<Modal open={false} onClose={() => {}} title="T">x</Modal>)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Escape (the native cancel event) calls onClose and is prevented so React state stays the source of truth', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T">x</Modal>)
    const ev = pressEscape(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(ev.defaultPrevented).toBe(true)
    expect(screen.getByRole('dialog')).toHaveAttribute('open')
  })

  it('a cancel that something else already handled does not call onClose', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T">x</Modal>)
    const ev = new Event('cancel', { cancelable: true })
    ev.preventDefault()
    fireEvent(screen.getByRole('dialog'), ev)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('a native close while still open (a second Escape without interaction) calls onClose once', () => {
    const onClose = vi.fn()
    const { rerender } = render(<Modal open onClose={onClose} title="T">x</Modal>)
    // the platform removes `open` and then fires close (the test setup's close() does the same)
    act(() => (screen.getByRole('dialog') as HTMLDialogElement).close())
    expect(onClose).toHaveBeenCalledTimes(1)
    onClose.mockClear()
    rerender(<Modal open={false} onClose={onClose} title="T">x</Modal>)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('clicking the backdrop (the dialog itself) calls onClose; clicking inside does not', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T"><p>Inside</p></Modal>)
    await userEvent.click(screen.getByText('Inside'))
    await userEvent.click(screen.getByRole('heading', { name: 'T' }))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('a drag that starts inside the card and ends on the backdrop does not close it', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T"><p>Inside</p></Modal>)
    const dialog = screen.getByRole('dialog')
    fireEvent.pointerDown(screen.getByText('Inside'))
    fireEvent.click(dialog) // the browser targets the common ancestor: the dialog itself
    expect(onClose).not.toHaveBeenCalled()
    // a press and release both on the backdrop still closes
    fireEvent.pointerDown(dialog)
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
    // a press on the backdrop that ends inside the card does not
    fireEvent.pointerDown(dialog)
    fireEvent.click(screen.getByText('Inside'))
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('under StrictMode (effects run twice) a native close still calls onClose once and the Modal can reopen', () => {
    function Parent({ onClose }: { onClose: () => void }) {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Reopen</button>
          <Modal open={open} onClose={() => { onClose(); setOpen(false) }} title="T">x</Modal>
        </>
      )
    }
    const onClose = vi.fn()
    render(<StrictMode><Parent onClose={onClose} /></StrictMode>)
    const dialog = screen.getByRole('dialog') as HTMLDialogElement
    expect(dialog).toHaveAttribute('open')
    act(() => dialog.close()) // the platform closing it (a second Escape)
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }))
    expect(dialog).toHaveAttribute('open')
  })

  it('under StrictMode, with close events that arrive a task later as in browsers, a native close calls onClose once', async () => {
    const original = HTMLDialogElement.prototype.close
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return
      this.removeAttribute('open')
      setTimeout(() => this.dispatchEvent(new Event('close')))
    }
    try {
      const onClose = vi.fn()
      render(<StrictMode><Modal open onClose={onClose} title="T">x</Modal></StrictMode>)
      const dialog = screen.getByRole('dialog') as HTMLDialogElement
      await new Promise((r) => setTimeout(r, 10)) // the StrictMode cleanup's own close event lands now
      expect(onClose).not.toHaveBeenCalled()
      expect(dialog).toHaveAttribute('open')
      dialog.close()
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    } finally {
      HTMLDialogElement.prototype.close = original
    }
  })

  it('unmounting while open closes the dialog and does not focus an opener that was removed with it', () => {
    function Page() {
      return (
        <>
          <button type="button">Opener</button>
          <Modal open onClose={() => {}} title="T">x</Modal>
        </>
      )
    }
    const { rerender, unmount } = render(<button type="button">Opener</button>)
    const first = screen.getByRole('button', { name: 'Opener' })
    first.focus()
    const focusSpy = vi.spyOn(first, 'focus')
    rerender(<Page />)
    const dialog = document.querySelector('dialog')!
    expect(dialog).toHaveAttribute('open')
    unmount()
    expect(dialog).not.toHaveAttribute('open')
    expect(first.isConnected).toBe(false)
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('a quick open, close, open flip leaves it open', () => {
    const onClose = vi.fn()
    const { rerender } = render(<Modal open onClose={onClose} title="T">x</Modal>)
    rerender(<Modal open={false} onClose={onClose} title="T">x</Modal>)
    rerender(<Modal open onClose={onClose} title="T">x</Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('open')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('takes a closeLabel for the close button, "Close" by default', () => {
    const { rerender } = render(<Modal open onClose={() => {}} title="T">x</Modal>)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    rerender(<Modal open onClose={() => {}} title="T" closeLabel="Fermer">x</Modal>)
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })

  it('has a labelled close button', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T">x</Modal>)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders the actions slot in a footer only when given', () => {
    const { rerender } = render(<Modal open onClose={() => {}} title="T">x</Modal>)
    expect(document.querySelector('.ds-modal__actions')).toBeNull()
    rerender(<Modal open onClose={() => {}} title="T" actions={<button type="button">Save</button>}>x</Modal>)
    expect(document.querySelector('.ds-modal__actions')).toContainElement(screen.getByRole('button', { name: 'Save' }))
  })

  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Opener</button>
        <Modal open={open} onClose={() => setOpen(false)} title="T">
          <button type="button">First</button>
        </Modal>
      </>
    )
  }

  it('returns focus to the opener after close', async () => {
    render(<Harness />)
    const opener = screen.getByRole('button', { name: 'Opener' })
    await userEvent.click(opener)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
  })

  it('Review Focus 4: two Modals mounted, opening one leaves the other closed and their title ids differ', () => {
    const { rerender } = render(
      <>
        <Modal open={false} onClose={() => {}} title="One">a</Modal>
        <Modal open={false} onClose={() => {}} title="Two">b</Modal>
      </>,
    )
    rerender(
      <>
        <Modal open onClose={() => {}} title="One">a</Modal>
        <Modal open={false} onClose={() => {}} title="Two">b</Modal>
      </>,
    )
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getByRole('dialog', { name: 'One' })).toBeInTheDocument()
    const dialogs = document.querySelectorAll('dialog')
    expect(dialogs[1]).not.toHaveAttribute('open')
    expect(dialogs[0]!.getAttribute('aria-labelledby')).not.toBe(dialogs[1]!.getAttribute('aria-labelledby'))
  })

  it('stacks: a Modal opened from inside another closes first, leaving the outer one open', async () => {
    const outerClose = vi.fn()
    function Stack() {
      const [inner, setInner] = useState(false)
      return (
        <Modal open onClose={outerClose} title="Outer">
          <button type="button" onClick={() => setInner(true)}>More</button>
          <Modal open={inner} onClose={() => setInner(false)} title="Inner">y</Modal>
        </Modal>
      )
    }
    render(<Stack />)
    const more = screen.getByRole('button', { name: 'More' })
    await userEvent.click(more)
    const inner = screen.getByRole('dialog', { name: 'Inner' })
    pressEscape(inner)
    // React bubbles cancel/close through its tree, so the outer Modal must ignore events that came from the inner one
    expect(outerClose).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Inner' })).toBeNull()
    expect(screen.getByRole('dialog', { name: 'Outer' })).toHaveAttribute('open')
    expect(more).toHaveFocus()
    expect(outerClose).not.toHaveBeenCalled()
  })

  it('a 300-character unbroken title renders whole and the css wraps it', () => {
    const long = 'w'.repeat(300)
    render(<Modal open onClose={() => {}} title={long}>x</Modal>)
    expect(screen.getByRole('heading', { name: long }).textContent).toHaveLength(300)
    expect(css).toMatch(/overflow-wrap:\s*anywhere/)
  })

  it('structure keeps head and actions in view while the body scrolls inside a viewport-relative card', () => {
    expect(css).toMatch(/max-height:\s*88dvh/)
    expect(css).toMatch(/\.ds-modal\s*\{[^}]*flex-direction:\s*column/)
    expect(css).toMatch(/\.ds-modal__body\s*\{[^}]*overflow-y:\s*auto/)
    expect(css).toMatch(/\.ds-modal__body\s*\{[^}]*min-height:\s*0/)
    expect(css).toMatch(/\.ds-modal__head\s*\{[^}]*flex:\s*none/)
    expect(css).toMatch(/\.ds-modal__actions\s*\{[^}]*flex:\s*none/)
  })

  it('uses tokens only and turns motion off under reduced motion', () => {
    expect(findLiterals(css)).toEqual([])
    expect(findMotionLiterals(css)).toEqual([])
    const reduced = css.slice(css.indexOf('prefers-reduced-motion'))
    expect(reduced).toMatch(/transition:\s*none/)
  })
})
