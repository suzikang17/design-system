import { defineMeta } from '@/client/catalog/meta'
import { Faq, type FaqProps } from './Faq'

export default defineMeta<FaqProps>({
  id: 'faq',
  name: 'Faq',
  group: 'sections',
  origin: ['urlovematters'],
  summary: 'A list of questions that open to show their answers, one at a time or several together, with a plus that turns to a cross.',
  component: Faq,
  defaults: {
    eyebrow: 'questions',
    heading: 'Things people ask',
    items: [
      'How does it work? A short answer that explains the first thing people want to know.',
      'How long does it take? A short answer about timing, written in plain words.',
      'Can I change my mind? A short answer about changes and what to do next.',
    ],
    single: true,
  },
  controls: {
    eyebrow: { type: 'text', label: 'Label above the heading' },
    heading: { type: 'text', label: 'Heading' },
    items: { type: 'list', label: 'Questions, written as "Question? Answer"' },
    single: { type: 'boolean', label: 'One open at a time' },
  },
  layout: 'full',
  cardProps: { eyebrow: '', heading: '', items: ['One question? A short answer.', 'Another question? A short answer.', 'A third question? A short answer.'] },
  homeTheme: 'urlovematters',
  files: ['src/client/components/faq/Faq.tsx', 'src/client/components/faq/faq.css', 'src/client/components/faq/faq.meta.ts'],
  registryDependencies: ['eyebrow'],
  usage: `import { Faq } from './client/components/faq/Faq'

<Faq
  eyebrow="questions"
  heading="Things people ask"
  items={[
    { question: 'How does it work?', answer: 'A short answer.' },
    'How long does it take? A short answer.',
  ]}
  single
/>`,
})
