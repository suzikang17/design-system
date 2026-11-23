import { defineMeta } from '@/client/catalog/meta'
import { CtaBand, type CtaBandProps } from './CtaBand'

export default defineMeta<CtaBandProps>({
  id: 'cta-band',
  name: 'CTA band',
  group: 'sections',
  origin: ['urlovematters', 'wecuratelife'],
  summary: 'The closing invitation near the end of a page: a tinted band with a large heading and buttons, or a quiet centred line with a small ornament and one outlined button.',
  component: CtaBand,
  defaults: {
    variant: 'band',
    heading: 'Ready when you are',
    text: 'A sentence or two on what happens after you get in touch.',
    buttonLabel: 'Get in touch',
    secondaryLabel: 'Learn more',
    animate: true,
  },
  controls: {
    variant: { type: 'select', label: 'Layout', options: ['band', 'mark'] },
    heading: { type: 'text', label: 'Heading' },
    text: { type: 'text', label: 'Text' },
    buttonLabel: { type: 'text', label: 'Button label' },
    secondaryLabel: { type: 'text', label: 'Second button label (band)' },
    animate: { type: 'boolean', label: 'Fade up on entering view' },
  },
  layout: 'full',
  cardProps: { text: '', secondaryLabel: '', animate: false },
  homeTheme: 'urlovematters',
  files: ['src/client/components/cta-band/CtaBand.tsx', 'src/client/components/cta-band/cta-band.css', 'src/client/components/cta-band/cta-band.meta.ts'],
  registryDependencies: ['button'],
  usage: `import { CtaBand } from './client/components/cta-band/CtaBand'

<CtaBand
  variant="band"
  heading="Ready when you are"
  text="A sentence or two."
  buttonLabel="Get in touch"
  buttonHref="/contact"
/>`,
})
