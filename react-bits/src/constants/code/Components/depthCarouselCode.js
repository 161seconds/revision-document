import code from '@content/Components/DepthCarousel/DepthCarousel.jsx?raw';
import css from '@content/Components/DepthCarousel/DepthCarousel.css?raw';
import tailwind from '@tailwind/Components/DepthCarousel/DepthCarousel.jsx?raw';
import tsCode from '@ts-default/Components/DepthCarousel/DepthCarousel.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/DepthCarousel/DepthCarousel.tsx?raw';

export const depthCarousel = {
  dependencies: `gsap`,
  usage: `import DepthCarousel from './DepthCarousel';

const items = [
  { image: 'https://picsum.photos/seed/a/800/1000', alt: 'One' },
  { image: 'https://picsum.photos/seed/b/800/1000', alt: 'Two' },
  { image: 'https://picsum.photos/seed/c/800/1000', alt: 'Three' },
  { image: 'https://picsum.photos/seed/d/800/1000', alt: 'Four' },
  { image: 'https://picsum.photos/seed/e/800/1000', alt: 'Five' }
];

<div style={{ height: '500px', position: 'relative' }}>
  <DepthCarousel
    items={items}
    depth={220}
    spread={90}
    tilt={22}
    tiltDirection="right"
    perspective={1400}
    visibleCards={4}
    falloff={0.2}
    blur={6}
    autoplay
    loop
  />
</div>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
