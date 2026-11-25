import { defineMeta } from '@/client/catalog/meta'
import { Footer, type FooterProps } from './Footer'

export default defineMeta<FooterProps>({
  id: 'footer',
  name: 'Footer',
  group: 'sections',
  origin: ['wecuratelife', 'urlovematters'],
  summary: 'The site footer: the name, a few links and social icons with the small print, centred in one column or spread across one row.',
  component: Footer,
  defaults: {
    brand: 'Studio name',
    tagline: 'A short line about the place',
    links: ['Journal', 'Contact'],
    social: [
      { kind: 'instagram', href: 'https://example.com/instagram' },
      { kind: 'email', href: 'mailto:hello@example.com' },
    ],
    variant: 'minimal',
    year: 2026,
    copyright: '',
  },
  controls: {
    brand: { type: 'text', label: 'Name' },
    tagline: { type: 'text', label: 'Short line' },
    links: { type: 'list', label: 'Links' },
    variant: { type: 'select', label: 'Layout', options: ['minimal', 'row'] },
    copyright: { type: 'text', label: 'Small print (blank for © year and name)' },
  },
  layout: 'full',
  homeTheme: 'wecuratelife',
  files: ['src/client/components/footer/Footer.tsx', 'src/client/components/footer/footer.css', 'src/client/components/footer/footer.meta.ts'],
  registryDependencies: [],
  usage: `import { Footer } from './client/components/footer/Footer'

<Footer
  brand="Studio name"
  links={[{ label: 'Journal', href: '/journal' }, { label: 'Contact', href: '/contact' }]}
  social={[{ kind: 'instagram', href: 'https://instagram.com/yourhandle' }]}
  variant="minimal"
/>`,
})
