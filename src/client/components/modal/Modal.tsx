'use client'
import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react'
import './modal.css'

export type ModalProps = {
  open: boolean
  onClose: () => void
  /** Shown in the header and used as the dialog's accessible name. */
  title: string
  children: ReactNode
  /** Footer content, usually buttons. The footer is left out when omitted. */
  actions?: ReactNode
  /** Accessible name of the close button. Defaults to "Close". */
  closeLabel?: string
}

/** A dialog on the native `<dialog>` element (`showModal()`): the platform supplies the top layer, the inert
 *  background, focus entry and the Escape key. `open` is the single source of truth; Escape and the backdrop
 *  ask for a close through `onClose` and the parent decides. Ported from the ur love matters dating deck.
 *
 *  `onClose` must set `open` to false. The platform can close the dialog by itself (a second Escape with no
 *  interaction in between cannot be prevented); `onClose` then reports a dialog that is already closed, and
 *  showing it again while the parent still says `open` would fight the platform, so the Modal does not. */
export function Modal({ open, onClose, title, children, actions, closeLabel = 'Close' }: ModalProps) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  // Set while the Modal closes the dialog itself (the effect cleanup), cleared by the close event that follows:
  // that event is ours, not a request from the platform. Survives StrictMode's double effect run.
  const closingSelf = useRef(false)
  // Whether the current press started on the backdrop (the dialog element itself); see onClick below.
  const pressOnBackdrop = useRef(false)

  useEffect(() => {
    const el = dialog.current
    if (!el || !open || el.open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    el.showModal()
    return () => {
      if (el.open) {
        closingSelf.current = true
        el.close()
      }
      // The platform returns focus on close; this covers engines and cases where it does not.
      if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true })
    }
  }, [open])

  // Escape: keep the dialog open and let the parent decide. A cancel that a nested widget (an open Select list)
  // already handled arrives with defaultPrevented and is not ours to act on.
  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    // React bubbles cancel/close through its component tree: ignore those from a Modal nested inside this one.
    if (e.defaultPrevented || e.target !== e.currentTarget) return
    e.preventDefault()
    onClose()
  }

  // The platform closed the dialog anyway (a second Escape without any interaction in between cannot be prevented).
  const onNativeClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return
    if (closingSelf.current) {
      closingSelf.current = false
      return
    }
    // a close event that arrives after the dialog was shown again is a late echo of our own close
    if (e.currentTarget.open) return
    onClose()
  }

  return (
    <dialog
      ref={dialog}
      className="ds-modal"
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClose={onNativeClose}
      // A click that lands on the dialog element itself is a click on its backdrop: the content fills the box.
      // Only a press that also started there counts: a drag from inside the card (selecting text in a field)
      // that ends on the backdrop is reported as a click on the dialog too, and must not close it.
      onPointerDown={(e) => {
        pressOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        const fromBackdrop = pressOnBackdrop.current
        pressOnBackdrop.current = false
        if (fromBackdrop && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ds-modal__head">
        <h2 id={titleId} className="ds-modal__title">
          {title}
        </h2>
        <button type="button" className="ds-modal__close" aria-label={closeLabel} onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M1 1l12 12M13 1L1 13" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="ds-modal__body">{children}</div>
      {actions ? <div className="ds-modal__actions">{actions}</div> : null}
    </dialog>
  )
}
