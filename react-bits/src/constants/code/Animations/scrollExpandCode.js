import code from '@content/Animations/ScrollExpand/ScrollExpand.jsx?raw';
import css from '@content/Animations/ScrollExpand/ScrollExpand.css?raw';
import tailwind from '@tailwind/Animations/ScrollExpand/ScrollExpand.jsx?raw';
import tsCode from '@ts-default/Animations/ScrollExpand/ScrollExpand.tsx?raw';
import tsTailwind from '@ts-tailwind/Animations/ScrollExpand/ScrollExpand.tsx?raw';

export const scrollExpand = {
  usage: `import ScrollExpand from './ScrollExpand';

<ScrollExpand
  src="/hero.jpg"
  alt="Product hero"
  title="Built to scale"
  scrollHint="Scroll"
  useWindowScroll
>
  <h2>Every pixel, everywhere</h2>
  <p>The frame opens up as you scroll and hands the whole stage to your media.</p>
</ScrollExpand>

<div style={{ height: '520px' }}>
  <ScrollExpand src="/hero.jpg" title="Built to scale" mediaZoom={1.35} />
</div>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
