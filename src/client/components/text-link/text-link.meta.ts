import { defineMeta } from '@/client/catalog/meta'
import { TextLink, type TextLinkProps } from './TextLink'

export default defineMeta<TextLinkProps>({
  id: 'text-link',
  name: 'TextLink',
  group: 'primitives',
  origin: ['urlovematters'],
  seenOn: 'https://urlovematters.com',
  summary: 'An understated inline link with a thin rule, an optional arrow that nudges on hover, and an optional growing underline.',
  component: TextLink,
  defaults: { href: '#', children: 'Read more', arrow: true, underline: 'static' },
  controls: {
    children: { type: 'text', label: 'Label' },
    arrow: { type: 'boolean', label: 'Arrow' },
    underline: { type: 'select', label: 'Underline', options: ['static', 'grow'] },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: ['src/client/components/text-link/TextLink.tsx', 'src/client/components/text-link/text-link.css', 'src/client/components/text-link/text-link.meta.ts'],
  usage: `import { TextLink } from './client/components/text-link/TextLink'

<TextLink href="/contact" arrow>Get in touch</TextLink>`,
})
