import { defineMeta } from '@/client/catalog/meta'
import { Gallery, type GalleryProps } from './Gallery'

// meta also loads under Node (registry build), where env is absent
const base = `${import.meta.env?.BASE_URL ?? '/'}placeholders/`
const portrait = (n: number) => ({ src: `${base}portrait-${n}.jpg`, alt: '', width: 1200, height: 1600 })
const landscape = (n: number) => ({ src: `${base}landscape-${n}.jpg`, alt: '', width: 1800, height: 1200 })

export default defineMeta<GalleryProps>({
  id: 'gallery',
  name: 'Gallery',
  group: 'galleries',
  origin: ['wecuratelife'],
  summary:
    'Photos as a staggered wall, where every other column starts lower so the rows step like brickwork, or as one staggered row that scrolls sideways.',
  component: Gallery,
  defaults: {
    images: [portrait(1), landscape(1), portrait(2), landscape(2), portrait(3), landscape(3)],
    layout: 'wall',
    columns: 3,
    crop: '4/5',
    stagger: 62.5,
    frame: 'print',
    tilt: 0.6,
    reveal: true,
    numbered: false,
  },
  controls: {
    layout: { type: 'select', label: 'Layout', options: ['wall', 'row'] },
    columns: { type: 'number', label: 'Wall columns on wide screens', min: 2, max: 3, step: 1 },
    crop: { type: 'select', label: 'Crop', options: ['4/5', 'none'] },
    stagger: { type: 'number', label: 'Wall stagger (% of a column)', min: 0, max: 100, step: 2.5 },
    frame: { type: 'select', label: 'Frame', options: ['print', 'plain'] },
    tilt: { type: 'number', label: 'Lean (degrees)', min: 0, max: 2, step: 0.1 },
    reveal: { type: 'boolean', label: 'Fade up on entering view (wall)' },
    numbered: { type: 'boolean', label: 'Numbers under the photos' },
  },
  layout: 'full',
  // the home card is small: four photos in two narrow columns, loaded at once and not waiting to fade in
  cardProps: { images: [portrait(1), landscape(1), portrait(2), landscape(2)], columns: 2, maxWidth: 180, reveal: false, loading: 'eager' },
  homeTheme: 'wecuratelife',
  files: ['src/client/components/gallery/Gallery.tsx', 'src/client/components/gallery/dealColumns.ts', 'src/client/components/gallery/gallery.css', 'src/client/components/gallery/gallery.meta.ts'],
  registryDependencies: ['photo'],
  usage: `import { Gallery } from './client/components/gallery/Gallery'

<Gallery
  images={[
    { src: '/one.jpg', alt: 'Short description', width: 1200, height: 1600 },
    { src: '/two.jpg', alt: 'Short description', width: 1800, height: 1200 },
  ]}
  layout="wall"
  columns={3}
  onSelect={(index) => openPhoto(index)}
/>`,
})
