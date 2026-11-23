import { defineMeta } from '@/client/catalog/meta'
import { Chips, type ChipsProps } from './Chips'

export default defineMeta<ChipsProps>({
  id: 'chips',
  name: 'Chips',
  group: 'primitives',
  origin: ['urlovematters'],
  seenOn: 'https://urlovematters.com',
  summary: 'A wrapping row of pill tags with a star mark, optionally rising in one by one as the group enters view.',
  component: Chips,
  defaults: { items: ['First tag', 'Second tag', 'Third tag', 'Fourth tag', 'Fifth tag'], stagger: true },
  controls: {
    items: { type: 'list', label: 'Items' },
    stagger: { type: 'boolean', label: 'Staggered rise' },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: ['src/client/components/chips/Chips.tsx', 'src/client/components/chips/chips.css', 'src/client/components/chips/chips.meta.ts'],
  usage: `import { Chips } from './client/components/chips/Chips'

<Chips items={["One", "Two", "Three"]} stagger />`,
})
