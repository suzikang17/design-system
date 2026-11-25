import { defineMeta } from '@/client/catalog/meta'
import { Textarea, type TextareaProps } from './Textarea'

export default defineMeta<TextareaProps>({
  id: 'textarea',
  name: 'Textarea',
  group: 'primitives',
  origin: ['wecuratelife', 'urlovematters'],
  seenOn: 'https://wecuratelife.com/contact',
  summary: 'The multi-line sibling of Input: same label, hint and error wiring; the boxed variant resizes vertically, the line variant does not.',
  component: Textarea,
  defaults: { label: '', variant: 'line', placeholder: 'Tell us about your project', hint: '', error: '', disabled: false },
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
    'src/client/components/textarea/Textarea.tsx',
    'src/client/components/textarea/textarea.meta.ts',
  ],
  registryDependencies: ['input'],
  usage: `import { Textarea } from './client/components/textarea/Textarea'

<Textarea label="Message" placeholder="Tell us about your project" />`,
})
