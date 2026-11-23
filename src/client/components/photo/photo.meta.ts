import { defineMeta } from '@/client/catalog/meta'
import { Photo, type PhotoProps } from './Photo'

export default defineMeta<PhotoProps>({
  id: 'photo',
  name: 'Photo',
  group: 'primitives',
  origin: ['wecuratelife', 'urlovematters'],
  summary:
    'One photo in a frame. Print and plain are ported from the live sites, mat from an unused rule on We Curate Life; cameo and arch are new designs drawn from notes in its source, not shipped client work.',
  component: Photo,
  defaults: {
    image: {
      src: `${import.meta.env?.BASE_URL ?? '/'}placeholders/portrait-1.jpg`, // meta also loads under Node (registry build), where env is absent,
      alt: '',
      width: 1200,
      height: 1600,
    },
    frame: 'print',
    ratio: '3/4',
    hoverZoom: false,
    tilt: -1.1,
    mat: 'plate',
    matSize: 'regular',
    maxWidth: 300,
    loading: 'lazy',
  },
  controls: {
    frame: { type: 'select', label: 'Frame', options: ['plain', 'print', 'mat', 'cameo', 'arch'] },
    ratio: { type: 'select', label: 'Ratio', options: ['3/4', '1/1', '3/2', 'auto'] },
    hoverZoom: { type: 'boolean', label: 'Zoom on hover' },
    mat: { type: 'select', label: 'Print mat', options: ['plate', 'white'] },
    matSize: { type: 'select', label: 'Print mat size', options: ['regular', 'small'] },
    maxWidth: { type: 'number', label: 'Max width (px)', min: 160, max: 720, step: 10 },
    tilt: { type: 'number', label: 'Tilt (degrees)', min: -3, max: 3, step: 0.1 },
  },
  layout: 'centered',
  // the 300px default (400px tall) overflows the 4:3 home card; eager, so the card is not an empty frame until
  // the lazy image scrolls into range
  cardProps: { maxWidth: 170, loading: 'eager' },
  homeTheme: 'wecuratelife',
  files: ['src/client/components/photo/Photo.tsx', 'src/client/components/photo/photo.css', 'src/client/components/photo/photo.meta.ts'],
  usage: `import { Photo } from './client/components/photo/Photo'

<Photo
  image={{ src: '/photo.jpg', alt: 'Short description', width: 1200, height: 1600 }}
  frame="print"
  tilt={-1.1}
  maxWidth={300}
  hoverZoom
/>`,
})
