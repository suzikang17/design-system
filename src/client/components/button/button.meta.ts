import { defineMeta } from '@/client/catalog/meta'
import { Button, type ButtonProps } from './Button'

export default defineMeta<ButtonProps>({
  id: 'button',
  name: 'Button',
  group: 'primitives',
  origin: ['wecuratelife', 'urlovematters'],
  summary: 'A label-face button that takes its look from the theme: filled and square, or outlined and inverting.',
  component: Button,
  defaults: { children: 'Label', variant: 'primary', hover: 'none' },
  controls: {
    children: { type: 'text', label: 'Label' },
    variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'outline', 'on-photo'] },
    hover: { type: 'select', label: 'Hover effect', options: ['none', 'sheen', 'wipe'] },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: [
    'src/client/components/button/Button.tsx',
    'src/client/components/button/button.css',
    'src/client/components/button/button.meta.ts',
  ],
  usage: `import { Button } from './client/components/button/Button'

<Button variant="primary" hover="sheen">Label</Button>`,
})
