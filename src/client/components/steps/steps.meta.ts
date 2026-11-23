import { defineMeta } from '@/client/catalog/meta'
import { Steps, type StepsProps } from './Steps'

export default defineMeta<StepsProps>({
  id: 'steps',
  name: 'Steps',
  group: 'sections',
  origin: ['urlovematters'],
  summary: 'A "how it works" section: a heading over a short numbered sequence of steps, in columns that fade up one after another.',
  component: Steps,
  defaults: {
    eyebrow: 'how it works',
    heading: 'Three steps from hello to done',
    steps: [
      'Say hello: A short line about the first conversation and what happens in it.',
      'Make a plan: A short line about how the work is planned together.',
      'Get started: A short line about what you receive and when.',
    ],
    numbered: true,
  },
  controls: {
    eyebrow: { type: 'text', label: 'Label above the heading' },
    heading: { type: 'text', label: 'Heading' },
    steps: { type: 'list', label: 'Steps, written as "Title: text"' },
    numbered: { type: 'boolean', label: 'Numbers' },
  },
  layout: 'full',
  cardProps: { eyebrow: '', heading: '', steps: ['One: a short line', 'Two: a short line', 'Three: a short line'] },
  homeTheme: 'urlovematters',
  files: ['src/client/components/steps/Steps.tsx', 'src/client/components/steps/steps.css', 'src/client/components/steps/steps.meta.ts'],
  registryDependencies: ['eyebrow'],
  usage: `import { Steps } from './client/components/steps/Steps'

<Steps
  eyebrow="how it works"
  heading="Three steps"
  steps={[
    { title: 'Say hello', text: 'A short line.' },
    'Make a plan: A short line.',
  ]}
/>`,
})
