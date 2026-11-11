import code from '@content/Components/DriftWall/DriftWall.jsx?raw';
import tailwind from '@tailwind/Components/DriftWall/DriftWall.jsx?raw';
import tsCode from '@ts-default/Components/DriftWall/DriftWall.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/DriftWall/DriftWall.tsx?raw';
import css from '@content/Components/DriftWall/DriftWall.css?raw';

export const driftWall = {
  dependencies: ``,
  usage: `import DriftWall from './DriftWall';

const items = [
  { image: 'https://picsum.photos/id/1015/600/400', title: 'Peaks', href: 'https://example.com/one' },
  { image: 'https://picsum.photos/id/1025/600/400', title: 'Pup', href: 'https://example.com/two' },
  { image: 'https://picsum.photos/id/1039/600/400', title: 'Falls', href: 'https://example.com/three' },
];

<div style={{ height: 600 }}>
  <DriftWall
    items={items}
    columns={5}
    tileWidth={200}
    tileHeight={132}
    gap={18}
    tilt={16}
    turn={-14}
    perspective={1200}
    depth={120}
    speed={42}
    direction="up"
    variance={0.45}
    parallax={0.6}
    lift={64}
    fade={0.6}
    dim={0.55}
    overlayColor="#060010"
  />
</div>
`,
  code,
  tailwind,
  tsCode,
  tsTailwind,
  css
};
