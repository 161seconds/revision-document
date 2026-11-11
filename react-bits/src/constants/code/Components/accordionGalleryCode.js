import code from '@content/Components/AccordionGallery/AccordionGallery.jsx?raw';
import css from '@content/Components/AccordionGallery/AccordionGallery.css?raw';
import tailwind from '@tailwind/Components/AccordionGallery/AccordionGallery.jsx?raw';
import tsCode from '@ts-default/Components/AccordionGallery/AccordionGallery.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/AccordionGallery/AccordionGallery.tsx?raw';

export const accordionGallery = {
  dependencies: `gsap`,
  usage: `import AccordionGallery from './AccordionGallery'

const items = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

<AccordionGallery
  items={items}
  defaultIndex={2}
  expandRatio={0.52}
  trigger="hover"
/>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
