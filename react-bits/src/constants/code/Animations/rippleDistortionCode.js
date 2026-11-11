import code from '@content/Animations/RippleDistortion/RippleDistortion.jsx?raw';
import css from '@content/Animations/RippleDistortion/RippleDistortion.css?raw';
import tailwind from '@tailwind/Animations/RippleDistortion/RippleDistortion.jsx?raw';
import tsCode from '@ts-default/Animations/RippleDistortion/RippleDistortion.tsx?raw';
import tsTailwind from '@ts-tailwind/Animations/RippleDistortion/RippleDistortion.tsx?raw';

export const rippleDistortion = {
  dependencies: `ogl`,
  usage: `import RippleDistortion from './RippleDistortion';

<div style={{ width: '600px', height: '400px' }}>
  <RippleDistortion
    src="/hero.jpg"
    brushSize={150}
    strength={0.2}
    swirl={1}
    rings={4}
    grayscale
  />
</div>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
