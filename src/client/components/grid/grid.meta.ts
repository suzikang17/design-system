import { withBlocks } from '@/client/catalog/LayoutDemo'
import { defineMeta } from '@/client/catalog/meta'
import { Grid, type GridProps } from './Grid'

export default defineMeta<GridProps>({
  id: 'grid',
  name: 'Grid',
  group: 'layout',
  origin: [],
  summary: 'Equal cells in rows: as many columns as fit, up to a number you set, with no breakpoints to manage.',
  component: Grid,
  demo: withBlocks(Grid, 6),
  defaults: { columns: 3, min: 220, gap: 'md', align: 'stretch' },
  controls: {
    columns: { type: 'number', label: 'Most columns', min: 1, max: 12, step: 1 },
    min: { type: 'number', label: 'Narrowest column (px)', min: 0, max: 600, step: 10 },
    gap: { type: 'select', label: 'Space between', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Top to bottom', options: ['start', 'center', 'end', 'stretch'] },
  },
  layout: 'full',
  cardProps: { min: 60, gap: 'xs' },
  homeTheme: 'neutral',
  files: ['src/client/components/grid/Grid.tsx', 'src/client/components/grid/grid.css', 'src/client/components/grid/grid.meta.ts'],
  registryDependencies: ['base'],
  usage: `import { Grid } from './client/components/grid/Grid'

<Grid columns={3} min={220} gap="md">
  <article>One</article>
  <article>Two</article>
  <article>Three</article>
</Grid>`,
})
