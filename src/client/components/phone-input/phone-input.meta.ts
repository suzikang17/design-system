import { defineMeta } from '@/client/catalog/meta'
import { PhoneInput, type PhoneInputProps } from './PhoneInput'

export default defineMeta<PhoneInputProps>({
  id: 'phone-input',
  name: 'Phone input',
  group: 'primitives',
  origin: ['wecuratelife'],
  seenOn: 'https://wecuratelife.com/contact',
  summary: 'An Input that formats US numbers as you type, (858) 555-0123, and leaves international numbers as typed.',
  component: PhoneInput,
  defaults: { label: '', variant: 'line', placeholder: 'Phone number', hint: '', error: '', disabled: false },
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
  files: ['src/client/components/phone-input/PhoneInput.tsx', 'src/client/components/phone-input/phone-input.meta.ts'],
  registryDependencies: ['input'],
  usage: `import { PhoneInput } from './client/components/phone-input/PhoneInput'

<PhoneInput label="Phone" defaultValue="8585550123" />`,
})
