import { defineMeta } from '@/client/catalog/meta'
import { NavBar, type NavBarProps } from './NavBar'

export default defineMeta<NavBarProps>({
  id: 'nav-bar',
  name: 'Nav bar',
  group: 'sections',
  origin: ['wecuratelife', 'urlovematters'],
  summary: 'The site header: the name at the left, the links at the right and an optional button, folding into a menu on small screens.',
  component: NavBar,
  defaults: {
    brand: 'Studio name',
    links: ['The work', 'About', 'Journal', 'Contact'],
    cta: 'Get in touch',
    variant: 'bar',
    sticky: false,
    current: 'About',
  },
  controls: {
    brand: { type: 'text', label: 'Name' },
    links: { type: 'list', label: 'Links' },
    cta: { type: 'text', label: 'Button label (blank for none)' },
    variant: { type: 'select', label: 'Layout', options: ['bar', 'menu'] },
    sticky: { type: 'boolean', label: 'Stay at the top while scrolling' },
    current: { type: 'text', label: 'Current page (a link label)' },
  },
  layout: 'full',
  cardProps: { cta: '' },
  homeTheme: 'wecuratelife',
  files: ['src/client/components/nav-bar/NavBar.tsx', 'src/client/components/nav-bar/nav-bar.css', 'src/client/components/nav-bar/nav-bar.meta.ts'],
  registryDependencies: ['button'],
  usage: `import { NavBar } from './client/components/nav-bar/NavBar'

<NavBar
  brand="Studio name"
  links={[{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]}
  cta="Book a call"
  ctaHref="/book"
  variant="bar"
  sticky
/>`,
})
