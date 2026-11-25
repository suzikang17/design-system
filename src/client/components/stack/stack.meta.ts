import { withBlocks } from '@/client/catalog/LayoutDemo'
import { defineMeta } from '@/client/catalog/meta'
import { Stack, type StackProps } from './Stack'

export default defineMeta<StackProps>({
  id: 'stack',
  name: 'Stack',
  group: 'layout',
  origin: [],
  summary: 'Children one under another, evenly spaced.',
  component: Stack,
  demo: withBlocks(Stack, 3),
  defaults: { gap: 'md', align: 'stretch' },
  controls: {
    gap: { type: 'select', label: 'Space between', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Across', options: ['stretch', 'start', 'center', 'end'] },
  },
  layout: 'full',
  homeTheme: 'neutral',
  files: ['src/client/components/stack/Stack.tsx', 'src/client/components/stack/stack.css', 'src/client/components/stack/stack.meta.ts'],
  registryDependencies: ['base'],
  usage: `import { Stack } from './client/components/stack/Stack'

<Stack gap="md">
  <h2>Heading</h2>
  <p>Words</p>
  <a href="/more">More</a>
</Stack>`,
})
