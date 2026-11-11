import code from '@content/Components/OptionWheel/OptionWheel.jsx?raw';
import css from '@content/Components/OptionWheel/OptionWheel.css?raw';
import tailwind from '@tailwind/Components/OptionWheel/OptionWheel.jsx?raw';
import tsCode from '@ts-default/Components/OptionWheel/OptionWheel.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/OptionWheel/OptionWheel.tsx?raw';

export const optionWheel = {
  usage: `import OptionWheel from './OptionWheel';

<OptionWheel
  items={['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave']}
  defaultSelected={2}
  textColor="#a6a6a6"
  activeColor="#ffffff"
  side="left"
  fontSize={3}
  spacing={1.4}
  curve={1}
  tilt={6}
  blur={2}
  fade={0.25}
  smoothing={200}
  inset={80}
  loop={false}
  draggable
  soundUrl="/sounds/click-soft.mp3"
  soundVolume={0.5}
  onChange={(index, item) => console.log(index, item)}
/>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
