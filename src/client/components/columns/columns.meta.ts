import { withBlocks } from '@/client/catalog/LayoutDemo'
import { defineMeta } from '@/client/catalog/meta'
import { Columns, type ColumnsProps } from './Columns'
import { splitShares } from './splitShares'

export default defineMeta<ColumnsProps>({
  id: 'columns',
  name: 'Columns',
  group: 'layout',
  origin: [],
  summary: 'Columns that share the width by a split, such as halves or two thirds and a third, and become one stack on a narrow screen.',
  component: Columns,
  demo: withBlocks(Columns, (props) => splitShares(props.split).length, { uneven: true }),
  defaults: { split: '1/1', gap: 'md', align: 'start', stackAt: 'md', reverse: false },
  controls: {
    split: { type: 'select', label: 'Split', options: ['1', '1/1', '1/1/1', '1/1/1/1', '2/1', '1/2', '3/1', '1/3', '1/2/1'] },
    gap: { type: 'select', label: 'Space between', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Top to bottom', options: ['start', 'center', 'end', 'stretch'] },
    stackAt: { type: 'select', label: 'Stack when narrower than', options: ['never', 'sm', 'md', 'lg'] },
    reverse: { type: 'boolean', label: 'Last column first when stacked' },
  },
  layout: 'full',
  cardProps: { stackAt: 'never', gap: 'sm' },
  homeTheme: 'neutral',
  files: ['src/client/components/columns/Columns.tsx', 'src/client/components/columns/splitShares.ts', 'src/client/components/columns/columns.css', 'src/client/components/columns/columns.meta.ts'],
  registryDependencies: ['base'],
  usage: `import { Columns } from './client/components/columns/Columns'

<Columns split="2/1" gap="lg" stackAt="md">
  <div>Two thirds</div>
  <div>One third</div>
</Columns>`,
})
