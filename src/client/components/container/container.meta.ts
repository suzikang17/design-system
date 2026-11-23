import { withBlocks } from '@/client/catalog/LayoutDemo'
import { defineMeta } from '@/client/catalog/meta'
import { Container, type ContainerProps } from './Container'

export default defineMeta<ContainerProps>({
  id: 'container',
  name: 'Container',
  group: 'layout',
  origin: [],
  summary: 'Centres content on the page, capped at a width, inside the same side gutters the sections use.',
  component: Container,
  demo: withBlocks(Container, 1, { padded: false }),
  defaults: { width: 'page', gutter: true, pad: false },
  controls: {
    width: { type: 'select', label: 'Widest', options: ['text', 'page', 'wide', 'full'] },
    gutter: { type: 'boolean', label: 'Side gutters' },
    pad: { type: 'boolean', label: 'Section spacing above and below' },
  },
  layout: 'full',
  homeTheme: 'neutral',
  files: ['src/client/components/container/Container.tsx', 'src/client/components/container/container.css', 'src/client/components/container/container.meta.ts'],
  registryDependencies: ['base'],
  usage: `import { Container } from './client/components/container/Container'

<Container width="page" pad>
  <h2>Anything</h2>
</Container>`,
})
