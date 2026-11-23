import { useState } from 'react'
import { Button } from '../button/Button'
import { Modal } from './Modal'

export type ModalDemoProps = {
  title: string
  body: string
  actionLabel: string
}

/** Catalog demo only (not shipped): a Button that opens the Modal and holds its open state. */
export function ModalDemo({ title, body, actionLabel }: ModalDemoProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        actions={
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel}
          </Button>
        }
      >
        <p>{body}</p>
      </Modal>
    </>
  )
}
