import { defineMeta } from '@/client/catalog/meta'
import { Hero, type HeroProps } from './Hero'

// meta also loads under Node (registry build), where env is absent
const base = `${import.meta.env?.BASE_URL ?? '/'}placeholders/`
const portrait = (n: number) => ({ src: `${base}portrait-${n}.jpg`, alt: '', width: 1200, height: 1600 })

export default defineMeta<HeroProps>({
  id: 'hero',
  name: 'Hero',
  group: 'sections',
  origin: ['urlovematters', 'wecuratelife'],
  summary: 'The opening section of a home page: the photo beside the words, or a large centred title with the photo tucked up under it.',
  component: Hero,
  defaults: {
    variant: 'split',
    eyebrow: 'A short label',
    title: 'A short line about the work',
    text: 'Two or three sentences that say who the page is for and what happens next.',
    ctaLabel: 'Get in touch',
    image: portrait(1),
    minHeight: 420,
    animate: true,
  },
  controls: {
    variant: { type: 'select', label: 'Layout', options: ['split', 'wordmark'] },
    eyebrow: { type: 'text', label: 'Label (split) or line above the photo (wordmark)' },
    title: { type: 'text', label: 'Title' },
    text: { type: 'text', label: 'Text' },
    ctaLabel: { type: 'text', label: 'Button label' },
    minHeight: { type: 'number', label: 'Least height (px)', min: 0, max: 900, step: 20 },
    animate: { type: 'boolean', label: 'Rise in on entering view' },
  },
  layout: 'full',
  cardProps: { minHeight: 0, text: '', ctaLabel: '', animate: false },
  homeTheme: 'urlovematters',
  files: ['src/client/components/hero/Hero.tsx', 'src/client/components/hero/hero.css', 'src/client/components/hero/hero.meta.ts'],
  registryDependencies: ['button', 'eyebrow', 'photo'],
  usage: `import { Hero } from './client/components/hero/Hero'

<Hero
  variant="split"
  eyebrow="A short label"
  title="A short line about the work"
  text="Two or three sentences."
  ctaLabel="Get in touch"
  ctaHref="/contact"
  image={{ src: '/portrait.jpg', alt: 'Short description', width: 1200, height: 1600 }}
/>`,
})
