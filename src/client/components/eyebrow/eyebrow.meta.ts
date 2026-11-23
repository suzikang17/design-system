import { defineMeta } from '@/client/catalog/meta'
import { Eyebrow, type EyebrowProps } from './Eyebrow'

export default defineMeta<EyebrowProps>({
  id: 'eyebrow',
  name: 'Eyebrow',
  group: 'primitives',
  origin: ['urlovematters'],
  seenOn: 'https://urlovematters.com',
  summary: 'A small tracked label above a heading, with an optional accent rule that draws in on entering view.',
  component: Eyebrow,
  defaults: { children: 'where we begin', line: true, as: 'p' },
  controls: {
    children: { type: 'text', label: 'Text' },
    line: { type: 'boolean', label: 'Drawn line' },
    as: { type: 'select', label: 'Element', options: ['p', 'span'] },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: ['src/client/components/eyebrow/Eyebrow.tsx', 'src/client/components/eyebrow/eyebrow.css', 'src/client/components/eyebrow/eyebrow.meta.ts'],
  usage: `import { Eyebrow } from './client/components/eyebrow/Eyebrow'

<Eyebrow line>where we begin</Eyebrow>`,
})
