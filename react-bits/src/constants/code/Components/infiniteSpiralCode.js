import code from '@content/Components/InfiniteSpiral/InfiniteSpiral.jsx?raw';
import css from '@content/Components/InfiniteSpiral/InfiniteSpiral.css?raw';
import tailwind from '@tailwind/Components/InfiniteSpiral/InfiniteSpiral.jsx?raw';
import tsCode from '@ts-default/Components/InfiniteSpiral/InfiniteSpiral.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/InfiniteSpiral/InfiniteSpiral.tsx?raw';

export const infiniteSpiral = {
  usage: `import InfiniteSpiral from './InfiniteSpiral';

const images = [
  { src: '/images/landscape-1.jpg', alt: 'Mountain lake' },
  { src: '/images/landscape-2.jpg', alt: 'Forest path' },
  { src: '/images/landscape-3.jpg', alt: 'Rocky summit' },
  { src: '/images/landscape-4.jpg', alt: 'Ocean shore' },
  { src: '/images/landscape-5.jpg', alt: 'Green meadow' },
  { src: '/images/landscape-6.jpg', alt: 'Desert light' }
];

<div style={{ height: '600px', position: 'relative', overflow: 'hidden' }}>
  <InfiniteSpiral
    items={images}
    animationMode="all"
    speed={0.55}
    radius={170}
    cardWidth={100}
    cardHeight={100}
    verticalSpacing={60}
    perspective={1000}
    cardRadius={10}
    centerScale={1.2}
    edgeBlur={6}
    cardsPerTurn={7}
    pauseOnHover
  />
</div>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
