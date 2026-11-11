import code from '@content/Components/LineSidebar/LineSidebar.jsx?raw';
import css from '@content/Components/LineSidebar/LineSidebar.css?raw';
import tailwind from '@tailwind/Components/LineSidebar/LineSidebar.jsx?raw';
import tsCode from '@ts-default/Components/LineSidebar/LineSidebar.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/LineSidebar/LineSidebar.tsx?raw';

export const lineSidebar = {
  usage: `import LineSidebar from './LineSidebar';

<LineSidebar
  items={['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase']}
  accentColor="#A855F7"
  textColor="#c4c4c4"
  markerColor="#6c6c6c"
  showIndex
  showMarker
  proximityRadius={100}
  maxShift={30}
  falloff="smooth"
  markerLength={60}
  markerGap={0}
  tickScale={0.5}
  scaleTick
  itemGap={20}
  fontSize={1.1}
  smoothing={100}
  defaultActive={0}
  onItemClick={(index, label) => console.log(index, label)}
/>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
