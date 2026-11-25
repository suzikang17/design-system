import { defineMeta } from '@/client/catalog/meta'
import { Select, type SelectProps } from './Select'

export default defineMeta<SelectProps>({
  id: 'select',
  name: 'Select',
  group: 'primitives',
  origin: ['wecuratelife'],
  seenOn: 'https://wecuratelife.com/contact',
  summary: 'A styled dropdown: a hint line that opens a hairline panel of choices, with arrow-key, type-ahead and Esc support and a hidden input for forms.',
  component: Select,
  defaults: { label: 'Type of project', options: ['Residential', 'Hospitality', 'Something else'], variant: 'line', placeholder: '', name: 'project-type' },
  controls: {
    label: { type: 'text', label: 'Label' },
    placeholder: { type: 'text', label: 'Placeholder' },
    options: { type: 'list', label: 'Options' },
    variant: { type: 'select', label: 'Variant', options: ['box', 'line'] },
    name: { type: 'text', label: 'Field name' },
  },
  // The open panel hangs below the button; the centered preview is tall enough for three or four options.
  layout: 'centered',
  previewWidth: 360,
  homeTheme: 'wecuratelife',
  files: [
    'src/client/components/select/Select.tsx',
    'src/client/components/select/select.css',
    'src/client/components/select/select.meta.ts',
  ],
  registryDependencies: ['input'],
  usage: `import { Select } from './client/components/select/Select'

<Select label="Type of project" name="type" options={["Residential", "Hospitality"]} variant="line" />`,
})
