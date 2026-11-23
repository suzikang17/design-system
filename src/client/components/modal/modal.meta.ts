import { defineMeta } from '@/client/catalog/meta'
import { ModalDemo, type ModalDemoProps } from './ModalDemo'

export default defineMeta<ModalDemoProps>({
  id: 'modal',
  name: 'Modal',
  group: 'primitives',
  origin: ['urlovematters'],
  seenOn: 'https://urlovematters.com/dating-deck',
  summary: 'A dialog on the native element: a soft card that fades and rises over a blurred backdrop, with a labelled close button, Esc and backdrop-click to close, and focus returned to the opener.',
  component: ModalDemo,
  defaults: { title: 'A quiet moment', body: 'Take a breath before you carry on. This dialog closes with Esc, the close button, or a click outside it.', actionLabel: 'Done' },
  controls: {
    title: { type: 'text', label: 'Title' },
    body: { type: 'text', label: 'Body' },
    actionLabel: { type: 'text', label: 'Action label' },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: ['src/client/components/modal/Modal.tsx', 'src/client/components/modal/modal.css', 'src/client/components/modal/modal.meta.ts'],
  // Modal.tsx does not import Button; Button is installed with it because the usage snippet (and the demo)
  // open and close the Modal with Buttons.
  registryDependencies: ['button'],
  usage: `import { useState } from 'react'
import { Button } from './client/components/button/Button'
import { Modal } from './client/components/modal/Modal'

const [open, setOpen] = useState(false)
<Button onClick={() => setOpen(true)}>Open</Button>
<Modal open={open} onClose={() => setOpen(false)} title="Title" actions={<Button onClick={() => setOpen(false)}>Done</Button>}>
  Body
</Modal>`,
})
