import { withBlocks } from '@/client/catalog/LayoutDemo'
import { defineMeta } from '@/client/catalog/meta'
import { Row, type RowProps } from './Row'

export default defineMeta<RowProps>({
  id: 'row',
  name: 'Row',
  group: 'layout',
  origin: [],
  summary: 'Children side by side at their own widths, wrapping to a new line when they run out of room.',
  component: Row,
  demo: withBlocks(Row, 4, { uneven: true }),
  defaults: { gap: 'sm', align: 'center', justify: 'start', wrap: true },
  controls: {
    gap: { type: 'select', label: 'Space between', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Top to bottom', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { type: 'select', label: 'Along the row', options: ['start', 'center', 'end', 'between'] },
    wrap: { type: 'boolean', label: 'Wrap to new lines' },
  },
  layout: 'full',
  homeTheme: 'neutral',
  files: ['src/client/components/row/Row.tsx', 'src/client/components/row/row.css', 'src/client/components/row/row.meta.ts'],
  registryDependencies: ['base'],
  usage: `import { Row } from './client/components/row/Row'

<Row gap="sm" justify="between">
  <a href="/">Home</a>
  <a href="/book">Book</a>
</Row>`,
})
