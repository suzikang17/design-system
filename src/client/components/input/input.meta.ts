import { defineMeta } from '@/client/catalog/meta'
import { Input, type InputProps } from './Input'

export default defineMeta<InputProps>({
  id: 'input',
  name: 'Input',
  group: 'primitives',
  origin: ['wecuratelife', 'urlovematters'],
  seenOn: 'https://wecuratelife.com/contact',
  summary: 'A labelled text field with hint and error lines, drawn as an underline or boxed in a hairline border, with typewriter-face placeholders where the theme has one.',
  component: Input,
  defaults: { label: '', variant: 'line', placeholder: 'Your name', hint: '', error: '', disabled: false },
  controls: {
    label: { type: 'text', label: 'Label' },
    placeholder: { type: 'text', label: 'Placeholder' },
    variant: { type: 'select', label: 'Variant', options: ['box', 'line'] },
    hint: { type: 'text', label: 'Hint' },
    error: { type: 'text', label: 'Error' },
    disabled: { type: 'boolean', label: 'Disabled' },
  },
  layout: 'centered',
  previewWidth: 360,
  homeTheme: 'wecuratelife',
  files: [
    'src/client/components/input/Field.tsx',
    'src/client/components/input/Input.tsx',
    'src/client/components/input/input.css',
    'src/client/components/input/input.meta.ts',
  ],
  usage: `import { Input } from './client/components/input/Input'

<Input label="Name" placeholder="Your name" hint="As on your ID" />`,
})
